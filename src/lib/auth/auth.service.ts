import { publish, subscribe } from 'pubsub-js';
import { UserInfo } from '@sheetbase/models';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';
import { LocalstorageService } from '../localstorage/localstorage.service';
import { isExpiredJWT, createPopup, getHost } from '../utils';

import { AuthCredential } from './types';
import { User } from './user';
import { AuthProvider } from './provider';

export class AuthService {

    SHEETBASE_USER_CHANGED = 'SHEETBASE_USER_CHANGED';
    SHEETBASE_USER_INFO = 'user_info';
    SHEETBASE_USER_CREDS = 'user_creds';

    private Api: ApiService;
    private Localstorage: LocalstorageService;

    app: AppService;
    currentUser: User = null;

    private oauthProvider: AuthProvider; // remember provider for using in processing oauth result

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .addBeforeHooks(async (data) => {
                if (!!this.currentUser) {
                    data.query['idToken'] = await this.currentUser.getIdToken();
                }
                return data;
            })
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'auth');
        // local storage
        this.Localstorage = this.app.Localstorage;
        // initial change state (signin locally)
        setTimeout(() => this.signInWithLocalUser(), 1000);
    }

    onAuthStateChanged(next: {(user: User)}) {
        subscribe(this.SHEETBASE_USER_CHANGED, (msg: any, user: User) => next(user));
    }

    async checkActionCode(code: string) {
        return await this.Api.get('/oob', { oobCode: code });
    }

    async createUserWithEmailAndPassword(email: string, password: string) {
        const { info, idToken, refreshToken } = await this.Api.put('/', {}, {
            email, password, offlineAccess: true,
        });
        const user = await this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        let user: User;
        if (!!this.currentUser) {
            user = this.currentUser;
        } else {
            const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
                email, password, offlineAccess: true,
            });
            user = await this.signIn(info, idToken, refreshToken);
        }
        return { user };
    }

    async signInWithCustomToken(token: string) {
        let user: User;
        if (!!this.currentUser) {
            user = this.currentUser;
        } else {
            const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
                customToken: token, offlineAccess: true,
            });
            user = await this.signIn(info, idToken, refreshToken);
        }
        return { user };
    }

    async signInAnonymously() {
        let user: User;
        if (!!this.currentUser) {
            user = this.currentUser;
        } else {
            const { info, idToken, refreshToken } = await this.Api.put('/', {}, {
                offlineAccess: true,
            });
            user = await this.signIn(info, idToken, refreshToken);
        }
        return { user };
    }

    async sendPasswordResetEmail(email: string) {
        return await this.Api.put('/oob', {}, { mode: 'resetPassword', email });
    }

    async verifyPasswordResetCode(code: string) {
        return await this.Api.get('/oob', { oobCode: code, mode: 'resetPassword' });
    }

    async confirmPasswordReset(code: string, newPassword: string) {
        return await this.Api.post('/oob', {}, {
            oobCode: code,
            mode: 'resetPassword',
            newPassword,
        });
    }

    async signInWithPopup(provider: AuthProvider) {
        if (!this.currentUser) {
            const providerConfig = !!this.app.options.authProviders ?
                this.app.options.authProviders[provider.providerId] : null;
            if (!!providerConfig) {
                // remember provider
                this.oauthProvider = provider;
                // add handler to parent window
                window['handleOauthResult'] = (fragment: string) => this.handleOauthResult(fragment);
                // process request
                const { clientId, redirectUri } = providerConfig;
                return createPopup({
                    url: provider.url(clientId, redirectUri || (getHost() + '/__/auth/handler')),
                });
            }
        }
    }

    googleAuthProvider() {
        return new AuthProvider(
            'google.com',
            'https://accounts.google.com/o/oauth2/v2/auth',
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        );
    }

    facebookAuthProvider() {
        return new AuthProvider(
            'facebook.com',
            'https://www.facebook.com/v3.2/dialog/oauth',
            'email',
        );
    }

    async signOut() {
        this.currentUser = null;
        // notify user change
        publish(this.SHEETBASE_USER_CHANGED, null);
        // remove user info & id token & refresh token from local
        await this.Localstorage.remove(this.SHEETBASE_USER_INFO);
        await this.Localstorage.remove(this.SHEETBASE_USER_CREDS);
    }

    private async signIn(info: UserInfo, idToken: string, refreshToken: string) {
        const { uid } = info;
        this.currentUser = new User(this.Api, info, idToken, refreshToken);
        // notify user change
        publish(this.SHEETBASE_USER_CHANGED, this.currentUser);
        // save user info & id token & refresh token to local
        await this.Localstorage.set(this.SHEETBASE_USER_INFO, info);
        await this.Localstorage.set(this.SHEETBASE_USER_CREDS, { uid, idToken, refreshToken });
        return this.currentUser;
    }

    private async signInWithLocalUser() {
        // retrieve local creds and info
        const creds: any = await this.Localstorage.get(this.SHEETBASE_USER_CREDS);
        let info: UserInfo = await this.Localstorage.get(this.SHEETBASE_USER_INFO);
        // log user in
        if (!!creds && !!info && creds.uid === info.uid) {
            let idToken = creds.idToken;
            // caching check
            const beenSeconds = (new Date().getTime() - new Date(info.lastLogin).getTime()) / 1000;
            if (beenSeconds > 86400) { // info expired, over 1 day
                // renew idToken if expired
                if (isExpiredJWT(idToken)) {
                    const expiredUser = new User(this.Api, info, idToken, creds.refreshToken);
                    idToken = await expiredUser.getIdToken();
                }
                // fetch new info
                info = await this.Api.get('/user', { idToken });
            }
            // sign user in
            this.signIn(info, idToken, creds.refreshToken);
        } else {
            // notify initial state changed
            publish(this.SHEETBASE_USER_CHANGED, null);
        }
    }

    private async handleOauthResult(result: string) {
        // if result available
        if (result !== '') {
            // process query
            const query = result.substr(1).split('&');
            // Parse the URI hash to fetch the access token
            const credential: AuthCredential = {};
            for (let i = 0; i < query.length; i++) {
                const [ key, value = null ] = query[i].split('=');
                let finalValue: any = value;
                if (key === 'scope') {
                    finalValue = value.split('%20');
                } else if (key === 'expires_in') {
                    finalValue = +value;
                }
                credential[key] = finalValue;
            }
            // get user profile
            if (!credential.access_token) {
                throw new Error('Sheetbase oauth error!'); // no access token
            } else {
                return await this.processOauthResult(credential);
            }
        }
    }

    private async processOauthResult(credential: AuthCredential) {
        const { access_token: accessToken } = credential;
        const { providerId } = this.oauthProvider;
        const { info, idToken, refreshToken } = await this.Api.get('/oauth', { providerId, accessToken });
        const user = await this.signIn(info, idToken, refreshToken);
        return { user };
    }

}