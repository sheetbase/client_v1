import { ResponseError } from '@sheetbase/core-server';

export function decodeJWTPayload(token: string) {
    const [, payloadStr ] = token.split('.');
    return JSON.parse(atob(payloadStr));
}

export function ApiException(result: ResponseError) {
    this.name = 'SheetbaseApiException';
    this.message = result.message;
    this.error = result;
}