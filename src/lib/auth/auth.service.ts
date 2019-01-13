import { publish, subscribe } from 'pubsub-js';
import { getItem, setItem, removeItem } from 'localforage';
import { get as getCookie, set as setCookie, remove as removeCookie } from 'js-cookie';
import { UserInfo } from '@sheetbase/user-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';
import { User } from './user';
import { SignInData } from './types';
import { decodeJWTPayload } from '../utils';

const AUTH_USER = 'AUTH_USER';
const ID_TOKEN_COOKIE = 'auth_id_token';
const REFRESH_TOKEN_COOKIE = 'auth_refresh_token';

export class AuthService {
    private options: Options;
    private Api: ApiService;

    currentUser: User = null;

    constructor(options: Options) {
        this.options = {
            authEndpoint: 'auth',
            ... options,
        };
        this.Api = new ApiService(options);
        // try sign in from local
        this.signInLocal();
    }

    endpoint(paths?: string | string[]) {
        return this.Api.buildEndpoint(this.options.authEndpoint, paths);
    }

    onAuthStateChanged(next: {(user: User)}) {
        subscribe(AUTH_USER, (msg: any, user: User) => next(user));
    }

    async checkActionCode(code: string) {
        return await this.Api.get(this.endpoint('oob'), { oobCode: code });
    }

    async createUserWithEmailAndPassword(email: string, password: string) {
        const { info, idToken, refreshToken } = await this.Api.put(this.endpoint(), {}, {
            email, password, offlineAccess: true,
        }) as SignInData;
        const user = this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const { info, idToken, refreshToken } = await this.Api.post(this.endpoint(), {}, {
            email, password, offlineAccess: true,
        });
        const user = this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async signInWithCustomToken(token: string) {
        const { info, idToken, refreshToken } = await this.Api.post(this.endpoint(), {}, {
            customToken: token, offlineAccess: true,
        });
        const user = this.signIn(info, idToken, refreshToken);
        return { user };
    }

    async sendPasswordResetEmail(email: string) {
        await this.Api.put(this.endpoint('oob'), {}, { mode: 'resetPassword', email });
    }

    async verifyPasswordResetCode(code: string) {
        return await this.Api.get(this.endpoint('oob'), { oobCode: code, mode: 'resetPassword' });
    }

    async confirmPasswordReset(code: string, newPassword: string) {
        await this.Api.post(this.endpoint('oob'), {}, {
            oobCode: code,
            mode: 'resetPassword',
            password: newPassword,
        });
    }

    async updateCurrentUser(user: User) {
        this.currentUser = user;
    }

    async signOut() {
        this.currentUser = null;
        // notify user change
        publish(AUTH_USER, null);
        // remove user info & id token & refresh token from local
        removeItem(AUTH_USER);
        removeCookie(ID_TOKEN_COOKIE);
        removeCookie(REFRESH_TOKEN_COOKIE);
    }

    private async signInLocal() {
        let info: UserInfo = await getItem(AUTH_USER); // retrieve user info
        if (!!info) {
            let idToken = getCookie(ID_TOKEN_COOKIE);
            const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
            // renew idToken if expired
            if ((new Date()).getTime() >= decodeJWTPayload(idToken)['exp']) {
                const expiredUser = new User(this, this.Api, info, idToken, refreshToken);
                idToken = await expiredUser.getIdToken();
            }
            // fetch new info
            info = await this.Api.get(this.endpoint(), { idToken });
            this.signIn(info, idToken, refreshToken);
        }
    }

    private signIn(info: UserInfo, idToken: string, refreshToken: string) {
        this.currentUser = new User(this, this.Api, info, idToken, refreshToken);
        // notify user change
        publish(AUTH_USER, this.currentUser);
        // save user info & id token & refresh token to local
        setItem(AUTH_USER, info);
        setCookie(ID_TOKEN_COOKIE, idToken);
        setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
        return this.currentUser;
    }

}