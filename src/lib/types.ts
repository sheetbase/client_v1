import { UserInfo } from '@sheetbase/user-server';
import { ApiService } from './api/api.service';

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

export interface BeforeRequest {
    (Api: ApiService): Promise<void>;
}

export interface ApiInstanceData {
    endpoint?: string;
    query?: {};
    body?: {};
    before?: BeforeRequest;
}

export interface SignInData {
    info: UserInfo;
    idToken: string;
    refreshToken?: string;
}
