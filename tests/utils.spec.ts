import { expect } from 'chai';
import { describe, it } from 'mocha';

import { decodeJWTPayload, ApiException } from '../src/lib/utils';

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

    it('#ApiException', () => {
        const error = { error: true, code: 'xxx', message: 'Route error ...' };
        const result = new ApiException(error);
        expect(result.name).to.equal('AppError');
        expect(result.message).to.equal('Route error ...');
        expect(result.error).to.eql(error);
    });

});