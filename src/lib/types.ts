import { UserInfo } from '@sheetbase/user-server';

export interface Options extends ApiOptions, DatabaseOptions, AuthOptions, StorageOptions, MailOptions {}

export interface ApiOptions {
    backendUrl: string;
    apiKey?: string;
}

export interface DatabaseOptions {
    databaseEndpoint?: string;
}

export interface AuthOptions {
    authEndpoint?: string;
}

export interface StorageOptions {
    storageEndpoint?: string;
}

export interface MailOptions {
    mailEndpoint?: string;
}

export interface ApiInstanceData {
    endpoint?: string;
    query?: {};
    body?: {};
}

export interface SignInData {
    info: UserInfo;
    idToken: string;
    refreshToken?: string;
}
