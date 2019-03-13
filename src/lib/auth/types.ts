export interface AuthOptions {
    authEndpoint?: string;
}

export type ProviderId = 'password' | 'custom' | 'anonymous' | 'google.com' | 'facebook.com' | 'twitter.com';

export interface UserInfo extends UserProfile {
    '#'?: number;
    uid?: string;
    providerId?: ProviderId;
    providerData?: any;
    email?: string;
    emailVerified?: boolean;
    createdAt?: string;
    lastLogin?: string;
    username?: string;
    phoneNumber?: string;
    claims?: {
        [claim: string]: any;
    };
    isAnonymous?: boolean;
    isNewUser?: boolean;
}

export interface UserProfile {
    displayName?: string;
    photoURL?: string;
}