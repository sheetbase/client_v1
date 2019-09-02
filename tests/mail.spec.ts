import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';
import { ApiService } from '../src/lib/api/api.service';

import { MailService } from '../src/lib/mail/mail.service';
import { mail } from '../src/lib/mail/index';

const mailService = new MailService(
  new AppService(),
);

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function before() {
  // @ts-ignore
  apiGetStub = sinon.stub(mailService.Api, 'get');
  // @ts-ignore
  apiPostStub = sinon.stub(mailService.Api, 'post');
  //
  apiGetStub.callsFake(async (endpoint, params) => {
    return { method: 'GET', endpoint, params };
  });
  apiPostStub.callsFake(async (endpoint, params, body) => {
    return { method: 'POST', endpoint, params, body };
  });
}

function after() {
  apiGetStub.restore();
  apiPostStub.restore();
}

describe('(Mail) Mail service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(mailService.app instanceof AppService).to.equal(true);
    // @ts-ignore
    expect(mailService.Api instanceof ApiService).to.equal(true);
  });

  it('endpoint', () => {
    // default
    // @ts-ignore
    expect(mailService.Api.baseEndpoint).to.equal('mail');
    // custom
    const mailService2 = new MailService(
      new AppService({
        mailEndpoint: 'xxx',
      }),
    );
    // @ts-ignore
    expect(mailService2.Api.baseEndpoint).to.equal('xxx');
  });

  it('#quota', async () => {
    const result = await mailService.quota();
    expect(result).to.eql({
      method: 'GET',
      endpoint: '/',
      params: {},
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
    expect(result).to.eql({
      method: 'POST',
      endpoint: '/',
      params: {},
      body: {
        mailingData: {
          recipient: 'xxx@xxx.xxx',
        },
        category: 'message',
        template: {
          hello: { name: 'John' },
        },
        silent: false,
      },
    });
  });

});

describe('(Mail) methods', () => {

  it('#mail (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;
    expect(
      mail.bind(null),
    ).to.throw('No app for mail component.');
  });

  it('#mail (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Mail: 'An Mail instance' }),
    };

    const result = mail();

    expect(result).to.equal('An Mail instance');
  });

  it('#mail (app has no .Mail)', () => {
    const result = mail(new AppService({ backendUrl: '' }));

    expect(result instanceof MailService).to.equal(true);
  });

});
