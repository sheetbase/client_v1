import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService, MockedApiService } from './_mocks';

import { MailService } from '../src/lib/mail/mail.service';
import { mail } from '../src/lib/mail/index';

const mailService = new MailService(
  new MockedAppService() as any,
);

function before() {}

function after() {}

describe('(Mail) Mail service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(mailService.app instanceof MockedAppService).equal(true);
    // @ts-ignore
    expect(mailService.Api instanceof MockedApiService).equal(true);
  });

  it('endpoint', () => {
    // default
    // @ts-ignore
    expect(mailService.Api.baseEndpoint).equal('mail');
    // custom
    const mailService2 = new MailService(
      new MockedAppService({
        mailEndpoint: 'xxx',
      }) as any,
    );
    // @ts-ignore
    expect(mailService2.Api.baseEndpoint).equal('xxx');
  });

  it('#quota', async () => {
    const result = await mailService.quota();
    expect(result).eql({
      method: 'GET',
      args: ['/'],
    });
  });

  it('#threads', async () => {
    const result = await mailService.threads();
    expect(result).eql({
      method: 'GET',
      args: ['/threads', { category: 'uncategorized' }],
    });
  });

  it('#send', async () => {
    const result = await mailService.send(
      {
        recipient: 'xxx@xxx.xxx',
      },
      'message',
      {
        hello: { name: 'John' },
      },
      false,
    );
    expect(result).eql({
      method: 'PUT',
      args: [
        '/',
        {},
        {
          mailingData: {
            recipient: 'xxx@xxx.xxx',
          },
          category: 'message',
          template: {
            hello: { name: 'John' },
          },
          silent: false,
        },
      ],
    });
  });

});

describe('(Mail) methods', () => {

  it('#mail (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;
    expect(
      mail.bind(null),
    ).throw('No app for mail component.');
  });

  it('#mail (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Mail: 'An Mail instance' }),
    };

    const result = mail();

    expect(result).equal('An Mail instance');
  });

  it('#mail (app has no .Mail)', () => {
    const result = mail(new MockedAppService() as any);

    expect(result instanceof MailService).equal(true);
  });

});
