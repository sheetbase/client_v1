import { publish, subscribe } from 'pubsub-js';
import { getItem, setItem, removeItem } from 'localforage';
import { getJSON as getCookie, set as setCookie, remove as removeCookie } from 'js-cookie';
import { UserInfo } from '@sheetbase/user-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';
import { User } from './user';
import { SignInData } from './types';
import { decodeJWTPayload } from '../utils';

const AUTH_USER = 'AUTH_USER';
const AUTH_CREDS = 'AUTH_CREDS';

export class AuthService {
    private options: Options;
    private Api: ApiService;

    currentUser: User = null;

    constructor(options: Options) {
        this.options = {
            authEndpoint: 'auth',
            ... options,
        };
        this.Api = new ApiService(options)
            .setData({ endpoint: this.options.authEndpoint });
    }

    onAuthStateChanged(next: {(user: User)}) {
        subscribe(AUTH_USER, (msg: any, user: User) => next(user));
    }

    async checkActionCode(code: string) {
        return await this.Api.get('/oob', { oobCode: code });
    }

    async createUserWithEmailAndPassword(email: string, password: string) {
        const { info, idToken, refreshToken } = await this.Api.put('/', {}, {
            email, password, offlineAccess: true,
        }) as SignInData;
        const user = this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
            email, password, offlineAccess: true,
        });
        const user = this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithCustomToken(token: string) {
        const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
            customToken: token, offlineAccess: true,
        });
        const user = this.signIn(info, idToken, refreshToken);
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
            password: newPassword,
        });
    }

    async signInLocal() {
        let info: UserInfo = await getItem(AUTH_USER); // retrieve user info
        if (!!info) {
            const { idToken: localIdToken, refreshToken } = getCookie(AUTH_CREDS);
            // renew idToken if expired
            let idToken = localIdToken;
            if ((new Date()).getTime() >= decodeJWTPayload(idToken)['exp']) {
                const expiredUser = new User(this.Api, info, idToken, refreshToken);
                idToken = await expiredUser.getIdToken();
            }
            // fetch new info
            info = await this.Api.get('/', { idToken });
            this.signIn(info, idToken, refreshToken);
        }
    }

    private signIn(info: UserInfo, idToken: string, refreshToken: string) {
        this.currentUser = new User(this.Api, info, idToken, refreshToken);
        // notify user change
        publish(AUTH_USER, this.currentUser);
        // save user info & id token & refresh token to local
        setItem(AUTH_USER, info);
        setCookie(AUTH_CREDS, { idToken, refreshToken });
        return this.currentUser;
    }

    async signOut() {
        this.currentUser = null;
        // notify user change
        publish(AUTH_USER, null);
        // remove user info & id token & refresh token from local
        removeItem(AUTH_USER);
        removeCookie(AUTH_CREDS);
    }

}