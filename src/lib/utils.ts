import { ResponseError } from '@sheetbase/core-server';

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