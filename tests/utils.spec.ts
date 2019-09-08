import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import {
  decodeJWTPayload,
  isExpiredJWT,
  isExpiredInSeconds,
  createPopup,
  getHost,
  md5,
  orderBy,
} from '../src/lib/utils';

global['atob'] = (b64: string) => Buffer.from(b64, 'base64').toString();

describe('utils', () => {

  it('#decodeJWTPayload', () => {
    // tslint:disable-next-line:max-line-length
    const result = decodeJWTPayload('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(result).eql({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('#isExpiredJWT', () => {
    const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U';
    const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      Buffer.from(JSON.stringify({
        exp: Math.ceil(new Date().getTime() / 1000), // expire now
      }))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/\=/g, '') +
      '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const TOKEN3 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      Buffer.from(JSON.stringify({
        exp: Math.ceil(new Date().getTime() / 1000) + 3600, // expire 1 hour from now
      }))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/\=/g, '') +
      '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const result1 = isExpiredJWT(TOKEN1);
    const result2 = isExpiredJWT(TOKEN2);
    const result3 = isExpiredJWT(TOKEN3);
    expect(result1).equal(true, 'no exp');
    expect(result2).equal(true, 'expired');
    expect(result3).equal(false, 'not expired');
  });

  it('#isExpiredInSeconds', () => {
    const nowSecs = Math.ceil(new Date().getTime() / 1000);
    const result1 = isExpiredInSeconds(nowSecs);
    const result2 = isExpiredInSeconds(nowSecs + 10);
    const result3 = isExpiredInSeconds(nowSecs + 10, 10);
    expect(result1).equal(true, 'expire now');
    expect(result2).equal(false, 'expire in 10 secs later');
    expect(result3).equal(true, 'expire in 10 secs later, but also cost 10 secs');
  });

  it('#createPopup (default configs)', () => {
    let openArgs: any;
    const oauthWindow: any = {};

    const openStub = sinon.stub(window, 'open');
    openStub.callsFake((...args) => {
      openArgs = args;
      // simulate 1s response
      setTimeout(() => {
        oauthWindow.closed = true;
      }, 1000);
      return oauthWindow;
    });

    const result = createPopup({ url: null });
    expect(openArgs).eql([
      '/',
      'SheetbaseOAuthLogin',
      'location=0,status=0,width=1024,height=768',
    ]);
    // reset
    openStub.restore();
  });

  it('#createPopup (custom configs)', () => {
    let openArgs: any;
    const oauthWindow: any = {};

    const openStub = sinon.stub(window, 'open');
    openStub.callsFake((...args) => {
      openArgs = args;
      // simulate 1s response
      setTimeout(() => {
        oauthWindow.closed = true;
      }, 1000);
      return oauthWindow;
    });

    const result = createPopup({
      url: '/oauth',
      name: 'XXX',
      options: 'xxx',
    });
    expect(openArgs).eql([
      '/oauth',
      'XXX',
      'xxx',
    ]);
    // reset
    openStub.restore();
  });

  it('#getHost (no base tag)', () => {
    const result = getHost();
    expect(result).equal('about:blank//undefined');
  });

  it('#getHost (has base tag)', () => {
    const getElementsByTagNameStub = sinon.stub(document, 'getElementsByTagName');
    getElementsByTagNameStub.callsFake(() => [{ href: 'https://xxx.xxx' }] as any);

    const result = getHost();
    expect(result).equal('https://xxx.xxx');
    // reset
    getElementsByTagNameStub.restore();
  });

  it('#md5', () => {
    const result1 = md5('xxx');
    const result2 = md5('xxx', 'abc');
    const result3 = md5('xxx', null, true);
    expect(result1).equal('f561aaf6ef0bf14d4208bb46a4ccb3ad');
    expect(result2).equal('132daa7422d3d79dd078ce8bd9f4155c');
    expect(result3).equal('õaªöï\u000bñMB\b»F¤Ì³­');
  });

  it('#orderBy', () => {
    const items = [
      { user: 'fred',   age: 48 },
      { user: 'barney', age: 34 },
      { user: 'fred',   age: 40 },
      { user: 'barney', age: 36 },
    ];
    const result = orderBy(items, ['user', 'age'], ['asc', 'desc']);
    expect(result).eql([
      { user: 'barney', age: 36 },
      { user: 'barney', age: 34 },
      { user: 'fred',   age: 48 },
      { user: 'fred',   age: 40 },
    ]);
  });

});