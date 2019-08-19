import { ResponseError } from './api/types';
import { PopupConfigs } from './app/types';

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

// create popup
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

// get app host
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

// convert string of data load from spreadsheet to correct data type
export function parseData(data: any) {
  if ((data + '').toLowerCase() === 'true') {
    // boolean TRUE
    data = true;
  } else if ((data + '').toLowerCase() === 'false') {
    // boolean FALSE
    data = false;
  } else if (!isNaN(data)) {
    // number
    data = Number(data);
  } else if (
    (data.substr(0, 1) === '{' && data.substr(-1) === '}') ||
    (data.substr(0, 1) === '[' && data.substr(-1) === ']')
  ) {
    // JSON
    try {
      data = JSON.parse(data);
    } catch (e) {
      // continue
    }
  }
  return data;
}

export function parseObject(obj: {}) {
  for (const key of Object.keys(obj)) {
    if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
      // delete null key
      delete obj[key];
    } else if ((obj[key] + '').toLowerCase() === 'true') {
      // boolean TRUE
      obj[key] = true;
    } else if ((obj[key] + '').toLowerCase() === 'false') {
      // boolean FALSE
      obj[key] = false;
    } else if (!isNaN(obj[key])) {
      // number
      obj[key] = Number(obj[key]);
    } else if (
      (obj[key].substr(0, 1) === '{' && obj[key].substr(-1) === '}') ||
      (obj[key].substr(0, 1) === '[' && obj[key].substr(-1) === ']')
    ) {
      // JSON
      try {
        obj[key] = JSON.parse(obj[key]);
      } catch (e) {
        // continue
      }
    }
  }
  return obj;
}

export function o2a<Obj, K extends keyof Obj, P extends Obj[K]>(
  object: Obj,
  keyName = '$key',
): Array<(P extends {[key: string]: any} ? P: {value: P}) & {$key: string}> {
  const data = [];
  for (const key of Object.keys(object || {})) {
    if (object[key] instanceof Object) {
      object[key][keyName] = key;
    } else {
      const value = object[key];
      object[key] = {};
      object[key][keyName] = key;
      object[key]['value'] = value;
    }
    data.push(object[key]);
  }
  return data;
}

export function a2o<Obj>(
  array: Obj[],
  keyName = '$key',
): {[key: string]: Obj} {
  const obj = {};
  for (let i = 0, l = (array || []).length; i < l; i++) {
    const item = array[i];
    obj[
      item[keyName] ||
      item['$key'] ||
      item['slug'] ||
      (item['id'] ? '' + item['id'] : null) ||
      (item['#'] ? '' + item['#'] : null) ||
      ('' + Math.random() * 1E20)
    ] = item;
  }
  return obj;
}

export function uniqueId(
  length = 12,
  startWith = '-',
): string {
  const maxLoop = length - 8;
  const ASCII_CHARS = startWith + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let lastPushTime = 0;
  const lastRandChars = [];
  let now = new Date().getTime();
  const duplicateTime = (now === lastPushTime);
  lastPushTime = now;
  const timeStampChars = new Array(8);
  let i;
  for (i = 7; i >= 0; i--) {
    timeStampChars[i] = ASCII_CHARS.charAt(now % 64);
    now = Math.floor(now / 64);
  }
  let uid = timeStampChars.join('');
  if (!duplicateTime) {
    for (i = 0; i < maxLoop; i++) {
      lastRandChars[i] = Math.floor(Math.random() * 64);
    }
  } else {
    for (i = maxLoop - 1; i >= 0 && lastRandChars[i] === 63; i--) {
      lastRandChars[i] = 0;
    }
    lastRandChars[i]++;
  }
  for (i = 0; i < maxLoop; i++) {
    uid += ASCII_CHARS.charAt(lastRandChars[i]);
  }
  return uid;
}
