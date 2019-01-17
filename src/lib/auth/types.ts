import { UserInfo } from '@sheetbase/user-server';

export interface AuthOptions {
    authEndpoint?: string;
}

export interface SignInData {
    info: UserInfo;
    idToken: string;
    refreshToken?: string;
}