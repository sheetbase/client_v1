export function decodeJWTPayload(token: string) {
    const [, payloadStr ] = token.split('.');
    return JSON.parse(atob(payloadStr));
}