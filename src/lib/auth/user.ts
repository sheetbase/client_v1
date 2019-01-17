import { UserInfo, UserProfile } from '@sheetbase/user-server';

import { ApiService } from '../api/api.service';
import { decodeJWTPayload } from '../utils';

export class User {
    private Api: ApiService;

    // user secret
    idToken: string;
    refreshToken: string;

    // user info
    uid: string;
    providerId: string;
    providerData: any;
    email: string;
    emailVerified: boolean;
    createdAt: number;
    lastLogin: number;
    username: string;
    phoneNumber: string;
    displayName: string;
    photoURL: string;
    claims: {[claim: string]: any};
    isAnonymous: boolean;
    isNewUser: boolean;

    constructor(
        Api: ApiService,
        info: UserInfo,
        idToken: string,
        refreshToken: string,
    ) {
        this.Api = Api;
        this.idToken = idToken;
        this.refreshToken = refreshToken;
        this.setInfo(info);
    }

    private setInfo(info: UserInfo) {
        const {
            uid, providerId, providerData,
            email, emailVerified, createdAt, lastLogin,
            username, phoneNumber, displayName, photoURL, claims,
            isAnonymous, isNewUser,
        } = info;
        this.uid = uid;
        this.providerId = providerId;
        this.providerData = providerData;
        this.email = email;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
        this.username = username;
        this.displayName = displayName;
        this.phoneNumber = phoneNumber;
        this.photoURL = photoURL;
        this.claims = claims;
        this.isAnonymous = isAnonymous;
        this.isNewUser = isNewUser;
        return info;
    }

    toJSON() {
        const uid = this.uid;
        const providerId = this.providerId;
        const providerData = this.providerData;
        const email = this.email;
        const emailVerified = this.emailVerified;
        const createdAt = this.createdAt;
        const lastLogin = this.lastLogin;
        const username = this.username;
        const phoneNumber = this.phoneNumber;
        const displayName = this.displayName;
        const photoURL = this.photoURL;
        const claims = this.claims;
        const isAnonymous = this.isAnonymous;
        const isNewUser = this.isNewUser;
        return {
            uid, providerId, providerData,
            email, emailVerified, createdAt, lastLogin,
            username, phoneNumber, displayName, photoURL, claims,
            isAnonymous, isNewUser,
        };
    }

    async getIdToken(forceRefresh = false) {
        // check expiration
        const mayValid = (new Date()).getTime() < decodeJWTPayload(this.idToken)['exp'];
        // renew
        if (!mayValid || forceRefresh) {
            const { idToken } = await this.Api.get('/token', {
                refreshToken: this.refreshToken,
            });
            this.idToken = idToken;
        }
        return this.idToken;
    }

    async getIdTokenResult(forceRefresh = false) {
        return decodeJWTPayload(await this.getIdToken(forceRefresh));
    }

    async sendEmailVerification() {
        return await this.Api.put('/action', {}, {
            mode: 'verifyEmail',
            email: this.email,
        });
    }

    async updateProfile(profile: UserProfile) {
        const newInfo = await this.Api.post('/user', {}, {
            idToken: this.getIdToken(),
            profile,
        });
        return this.setInfo(newInfo);
    }

    async setUsername(username: string) {
        const newInfo = await this.Api.post('/user/username', {}, {
            idToken: this.getIdToken(),
            username,
        });
        return this.setInfo(newInfo);
    }

    async changePassword(currentPassword: string, newPassword: string) {
        return await this.Api.post('/user/password', {}, {
            idToken: this.getIdToken(),
            currentPassword,
            newPassword,
        });
    }

    // TODO: async updateEmail(newEmail: string) {}

    // TODO: async updatePassword(newPassword: string) {}

    // TODO: async updatePhoneNumber(phoneCredential: any) {}

    async logout() {
        return await this.Api.delete('/', {}, {
            idToken: this.getIdToken(),
        });
    }

    async delete() {
        return await this.Api.delete('/cancel', {}, {
            idToken: this.getIdToken(),
            refreshToken: this.refreshToken,
        });
    }

}