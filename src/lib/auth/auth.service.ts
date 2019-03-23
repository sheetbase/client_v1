import { publish, subscribe } from 'pubsub-js';
import { getItem, setItem, removeItem } from 'localforage';
import { UserInfo } from '@sheetbase/models';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';
import { isExpiredJWT } from '../utils';

import { User } from './user';

const SHEETBASE_USER_CHANGED = 'SHEETBASE_USER_CHANGED';
const SHEETBASE_USER_INFO = 'SHEETBASE_USER_INFO';
const SHEETBASE_USER_CREDS = 'SHEETBASE_USER_CREDS';

export class AuthService {

    private Api: ApiService;

    app: AppService;
    currentUser: User = null;

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
    }

    onAuthStateChanged(next: {(user: User)}) {
        subscribe(SHEETBASE_USER_CHANGED, (msg: any, user: User) => next(user));
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
        const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
            email, password, offlineAccess: true,
        });
        const user = await this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithCustomToken(token: string) {
        const { info, idToken, refreshToken } = await this.Api.post('/', {}, {
            customToken: token, offlineAccess: true,
        });
        const user = await this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInAnonymously() {
        const { info, idToken, refreshToken } = await this.Api.put('/', {}, {
            offlineAccess: true,
        });
        const user = await this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithLocalUser() {
        let info: UserInfo = await getItem(SHEETBASE_USER_INFO); // retrieve user info
        if (!!info) {
            const { uid } = info;
            const {
                idToken: localIdToken,
                refreshToken,
            } = await getItem(SHEETBASE_USER_CREDS + '_' + uid) || {} as any;
            if (!!localIdToken && !!refreshToken) {
                let idToken = localIdToken;
                // renew idToken if expired
                if (isExpiredJWT(idToken)) {
                    const expiredUser = new User(this.Api, info, idToken, refreshToken);
                    idToken = await expiredUser.getIdToken();
                }
                // fetch new info
                info = await this.Api.get('/user', { idToken });
                // sign user in
                this.signIn(info, idToken, refreshToken);
            }
        }
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

    private async signIn(info: UserInfo, idToken: string, refreshToken: string) {
        const { uid } = info;
        this.currentUser = new User(this.Api, info, idToken, refreshToken);
        // notify user change
        publish(SHEETBASE_USER_CHANGED, this.currentUser);
        // save user info & id token & refresh token to local
        await setItem(SHEETBASE_USER_INFO, info);
        await setItem(SHEETBASE_USER_CREDS + '_' + uid, { idToken, refreshToken });
        return this.currentUser;
    }

    async signOut() {
        if (!!this.currentUser) {
            const { uid } = this.currentUser;
            this.currentUser = null;
            // notify user change
            publish(SHEETBASE_USER_CHANGED, null);
            // remove user info & id token & refresh token from local
            await removeItem(SHEETBASE_USER_INFO);
            await removeItem(SHEETBASE_USER_CREDS + '_' + uid);
        }
    }

}