import { UserInfo } from '@sheetbase/user-server';

export interface SignInData {
    info: UserInfo;
    idToken: string;
    refreshToken?: string;
}