import { ResponseError } from '@sheetbase/core-server';
import { PopupConfigs } from './types';

export function decodeJWTPayload(token: string) {
    const [, payloadStr ] = token.split('.');
    return JSON.parse(atob(payloadStr));
}

export function isExpiredJWT(token: string) {
    const { exp } = decodeJWTPayload(token);
    return isExpiredInSeconds(exp || 0, 60); // exp or always, and 1 minute earlier
}

export function ApiError(result: ResponseError) {
    this.name = 'ApiError';
    this.message = result.message;
    this.error = result;
}

export function isExpiredInSeconds(expiredTime: number, costMore = 0) {
    const time = Math.ceil(new Date().getTime() / 1000) + costMore;
    return time >= expiredTime;
}

export function createPopup(config: PopupConfigs) {
  const url = config.url || '/';
  const name = config.name ||  'SheetbaseOAuthLogin'; // no space for IE
  const options = config.options || (
    'location=0,status=0' +
    ',width=' + window.innerWidth +
    ',height=' + window.innerHeight
    );
  const callback = config.callback || (() => true);
  // launch window
  const oauthWindow = window.open(url, name, options);
  // cackback
  const oauthInterval = window.setInterval(() => {
    if (oauthWindow.closed) {
      window.clearInterval(oauthInterval);
      callback();
    }
  }, 1000);
}

export function getHost() {
  let host: string;
  // get from base tag
  // else from window.location.href
  const baseHref = ((document.getElementsByTagName('base')[0] || {})['href'] || '').slice(0, -1);
  if (!!baseHref) {
    host = baseHref;
  } else {
    const hrefSplit = window.location.href.split('/').filter(Boolean);
    host = hrefSplit[0] + '//' + hrefSplit[1];
  }
  return host;
}
