import { UserProviderId } from '@sheetbase/models';

export interface AuthProvider {
  clientId: string;
  redirectUri?: string;
}

export interface AuthOptions {
  authEndpoint?: string;
  authProviders?: {
    [key in UserProviderId]?: AuthProvider;
  };
}

export interface AuthCredential {
  access_token?: string;
  expires_in?: number;
  scope?: string[];
  token_type?: string;
}
