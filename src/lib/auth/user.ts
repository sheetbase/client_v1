import { UserData } from '@sheetbase/user-server';

import { ApiService } from '../api/api.service';
import { AuthService } from './auth.service';
import { decodeJWTPayload } from '../utils';

export class User {
    private Auth: AuthService;
    private Api: ApiService;

    private idToken: string;
    refreshToken: string;

    private profile: UserData;
    // user info
    uid: string;
    provider: string;
    email: string;
    emailVerified: boolean;
    createdAt: number;
    lastLogin: number;
    username: string;
    displayName: string;
    phoneNumber: string;
    photoUrl: string;
    claims: {[claim: string]: any};

    constructor(
        Auth: AuthService,
        Api: ApiService,
        profile: UserData,
        idToken: string,
        refreshToken: string,
    ) {
        this.Auth = Auth;
        this.Api = Api;
        this.idToken = idToken;
        this.refreshToken = refreshToken;
        this.setProfile(profile);
    }

    private setProfile(profile: UserData) {
        this.profile = profile;
        // user info
        this.uid = this.profile.uid;
        this.provider = this.profile.provider;
        this.email = this.profile.email;
        this.emailVerified = this.profile.emailVerified;
        this.createdAt = this.profile.createdAt;
        this.lastLogin = this.profile.lastLogin;
        this.username = this.profile.username;
        this.displayName = this.profile.displayName;
        this.phoneNumber = this.profile.phoneNumber;
        this.photoUrl = this.profile.photoUrl;
        this.claims = this.profile.claims;

    }

    toJSON() {
        return this.profile;
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

    async updateProfile(profile: UserData) {
        this.setProfile(
            await this.Api.post(this.Auth.endpoint(), {}, { profile }),
        );
    }

    async sendEmailVerification() {
        await this.Api.put(this.Auth.endpoint('action'), {}, {
            mode: 'emailConfirmation',
            email: this.email,
        });
    }

}