import { UserProviderId } from '@sheetbase/models';

export class AuthProvider {

  providerId: UserProviderId;
  endpoint: string;
  scopes: string;
  customParameters: {};

  constructor(providerId: UserProviderId, endpoint: string, scopes: string) {
    this.providerId = providerId;
    this.endpoint = endpoint;
    this.scopes = scopes;
  }

  addScope(scope: string) {
    this.scopes = this.scopes + ' ' + scope;
  }

  setCustomParameters(customOAuthParameters: {}) {
    this.customParameters = customOAuthParameters;
  }

  url(clientId: string, redirectUri: string) {
    let params = '';
    if (!!this.customParameters) {
      for (const key of Object.keys(this.customParameters)) {
        params += '&' + key + '=' + this.customParameters[key];
      }
    }
    return this.endpoint + '?' +
      `response_type=token&` +
      `client_id=${ clientId }&` +
      `redirect_uri=${ redirectUri }&` +
      `scope=${ this.scopes }` +
      params;
  }

}