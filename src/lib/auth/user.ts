import { UserInfo, UserEditableProfile, UserProfileSettings } from '@sheetbase/models';

import { ApiService } from '../api/api.service';
import { decodeJWTPayload, isExpiredJWT } from '../utils';

export class User {
    private Api: ApiService;

    // user secret
    idToken: string;
    refreshToken: string;

    // user info
    uid: string;
    providerId: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    lastLogin: string;
    username: string;
    phoneNumber: string;
    displayName: string;
    photoURL: string;
    bio: string;
    url: string;
    address: string;
    additionalData: {[key: string]: any};
    claims: {[claim: string]: any};
    settings: UserProfileSettings;
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
            uid,
            providerId,
            email,
            emailVerified,
            createdAt,
            lastLogin,
            username,
            phoneNumber,
            displayName,
            photoURL,
            bio,
            url,
            address,
            additionalData,
            claims,
            settings,
            isAnonymous,
            isNewUser,
        } = info;
        this.uid = uid;
        this.providerId = providerId;
        this.email = email;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
        this.username = username;
        this.displayName = displayName;
        this.phoneNumber = phoneNumber;
        this.photoURL = photoURL;
        this.bio = bio;
        this.url = url;
        this.address = address;
        this.additionalData = additionalData;
        this.claims = claims;
        this.settings = settings;
        this.isAnonymous = isAnonymous;
        this.isNewUser = isNewUser;
        return info;
    }

    toJSON() {
        const uid = this.uid;
        const providerId = this.providerId;
        const email = this.email;
        const emailVerified = this.emailVerified;
        const createdAt = this.createdAt;
        const lastLogin = this.lastLogin;
        const username = this.username;
        const phoneNumber = this.phoneNumber;
        const displayName = this.displayName;
        const photoURL = this.photoURL;
        const bio = this.bio;
        const url = this.url;
        const address = this.address;
        const additionalData = this.additionalData;
        const claims = this.claims;
        const settings = this.settings;
        const isAnonymous = this.isAnonymous;
        const isNewUser = this.isNewUser;
        return {
            uid,
            providerId,
            email,
            emailVerified,
            createdAt,
            lastLogin,
            username,
            phoneNumber,
            displayName,
            photoURL,
            bio,
            url,
            address,
            additionalData,
            claims,
            settings,
            isAnonymous,
            isNewUser,
        };
    }

    async getIdToken(forceRefresh = false) {
        // renew
        if (isExpiredJWT(this.idToken) || forceRefresh) {
            const { idToken } = await this.Api.get('/token', {
                refreshToken: this.refreshToken,
            });
            this.idToken = idToken;
        }
        return this.idToken;
    }

    async getIdTokenResult(forceRefresh = false) {
        const idToken = await this.getIdToken(forceRefresh);
        return decodeJWTPayload(idToken);
    }

    async sendEmailVerification() {
        if (!this.emailVerified) {
            return await this.Api.put('/oob', {}, {
                mode: 'verifyEmail',
                email: this.email,
            });
        }
    }

    async updateProfile(profile: UserEditableProfile) {
        const newInfo = await this.Api.post('/user', {}, {
            profile,
        });
        return this.setInfo(newInfo);
    }

    async setAdditionalData(data: {[key: string]: any}) {
        const newInfo = await this.Api.post('/user/additional', {}, {
            additionalData: data,
        });
        return this.setInfo(newInfo);
    }

    async setSettings(data: {[key: string]: any}) {
        const newInfo = await this.Api.post('/user/settings', {}, {
            settings: data,
        });
        return this.setInfo(newInfo);
    }

    async setProfilePublicly(props: string | string[]) {
        const newInfo = await this.Api.post('/user/publicly', {}, {
            publicly: props,
        });
        return this.setInfo(newInfo);
    }

    async setProfilePrivately(props: string | string[]) {
        const newInfo = await this.Api.post('/user/privately', {}, {
            privately: props,
        });
        return this.setInfo(newInfo);
    }

    async setUsername(username: string) {
        const newInfo = await this.Api.post('/user/username', {}, {
            username,
        });
        return this.setInfo(newInfo);
    }

    async changePassword(currentPassword: string, newPassword: string) {
        return await this.Api.post('/user/password', {}, {
            currentPassword,
            newPassword,
        });
    }

    async logout() {
        return await this.Api.delete('/');
    }

    async delete() {
        return await this.Api.delete('/cancel', {}, {
            refreshToken: this.refreshToken,
        });
    }

}