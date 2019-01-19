import { expect } from 'chai';
import { describe, it } from 'mocha';

import { decodeJWTPayload, ApiError, isExpiredInSeconds } from '../src/lib/utils';

global['atob'] = (b64: string) => Buffer.from(b64, 'base64').toString();

describe('utils', () => {

    it('#decodeJWTPayload', () => {
        // tslint:disable-next-line:max-line-length
        const result = decodeJWTPayload('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        expect(result).to.eql({
            sub: '1234567890',
            name: 'John Doe',
            iat: 1516239022,
        });
    });

    it('#ApiError', () => {
        const error = { error: true, code: 'xxx', message: 'Route error ...' };
        const result = new ApiError(error);
        expect(result.name).to.equal('ApiError');
        expect(result.message).to.equal('Route error ...');
        expect(result.error).to.eql(error);
    });

    it('#isExpiredInSeconds', () => {
        const nowSecs = Math.ceil(new Date().getTime() / 1000);
        const result1 = isExpiredInSeconds(nowSecs);
        const result2 = isExpiredInSeconds(nowSecs + 10);
        const result3 = isExpiredInSeconds(nowSecs + 10, 10);
        expect(result1).to.equal(true, 'expire now');
        expect(result2).to.equal(false, 'expire in 10 secs later');
        expect(result3).to.equal(true, 'expire in 10 secs later, but also cost 10 secs');
    });

});