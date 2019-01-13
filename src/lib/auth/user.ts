import { UserInfo, UserProfile } from '@sheetbase/user-server';

import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';
import { decodeJWTPayload } from '../utils';

export class User {
    private Auth: AuthService;
    private Api: ApiService;

    private idToken: string;
    refreshToken: string;

    // user info
    private info: UserInfo;
    uid: string;
    providerId: string;
    providerData: any;
    email: string;
    emailVerified: boolean;
    createdAt: number;
    lastLogin: number;
    username: string;
    displayName: string;
    phoneNumber: string;
    photoURL: string;
    claims: {[claim: string]: any};

    constructor(
        Auth: AuthService,
        Api: ApiService,
        info: UserInfo,
        idToken: string,
        refreshToken: string,
    ) {
        this.Auth = Auth;
        this.Api = Api;
        this.idToken = idToken;
        this.refreshToken = refreshToken;
        this.setInfo(info);
    }

    private setInfo(info: UserInfo) {
        this.info = info;
        // user info
        this.uid = this.info.uid;
        this.providerId = this.info.providerId;
        this.providerData = this.info.providerData;
        this.email = this.info.email;
        this.emailVerified = this.info.emailVerified;
        this.createdAt = this.info.createdAt;
        this.lastLogin = this.info.lastLogin;
        this.username = this.info.username;
        this.displayName = this.info.displayName;
        this.phoneNumber = this.info.phoneNumber;
        this.photoURL = this.info.photoURL;
        this.claims = this.info.claims;
    }

    toJSON() {
        return { ... this.info };
    }

    async getIdToken(forceRefresh = false) {
        // check expiration
        const assumeValid = (new Date()).getTime() < decodeJWTPayload(this.idToken)['exp'];
        // renew
        if (!assumeValid || forceRefresh) {
            const { idToken } = await this.Api.get(this.Auth.endpoint('token'), {
                refreshToken: this.refreshToken,
            });
            this.idToken = idToken;
        }
        return this.idToken;
    }

    async getIdTokenResult(forceRefresh = false) {
        return decodeJWTPayload(
            await this.getIdToken(forceRefresh),
        );
    }

    async sendEmailVerification() {
        await this.Api.put(this.Auth.endpoint('action'), {}, {
            mode: 'verifyEmail',
            email: this.email,
        });
    }

    // TODO: async updateEmail(newEmail: string) {}

    // TODO: async updatePassword(newPassword: string) {}

    // TODO: async updatePhoneNumber(phoneCredential: any) {}

    async updateProfile(profile: UserProfile) {
        this.setInfo(
            await this.Api.post(this.Auth.endpoint(), {}, { profile }),
        );
    }

    async delete() {
        await this.Api.delete(this.Auth.endpoint('cancel'), {}, {
            refreshToken: this.refreshToken,
        });
    }

}