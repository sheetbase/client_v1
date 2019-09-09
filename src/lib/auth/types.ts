import { UserProviderId } from '@sheetbase/models';

export interface AuthOptions {
  authEndpoint?: string;
  authProviders?: {
    [key in UserProviderId]?: OauthProvider;
  };
}

export interface OauthProvider {
  clientId: string;
  redirectUri?: string;
}

export interface AuthCredential {
  access_token?: string;
  expires_in?: number;
  scope?: string[];
  token_type?: string;
}
