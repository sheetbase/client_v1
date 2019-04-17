import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import 'jsdom-global/register';

import { AppService } from '../src/lib/app/app.service';
import { ApiService } from '../src/lib/api/api.service';

import { StorageService } from '../src/lib/storage/storage.service';
import { storage } from '../src/lib/storage/index';

const storageService = new StorageService(
  new AppService({ backendUrl: '' }),
);

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function before() {
  // @ts-ignore
  apiGetStub = sinon.stub(storageService.Api, 'get');
  // @ts-ignore
  apiPostStub = sinon.stub(storageService.Api, 'post');
  // stub
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

describe('(Storage) Storage service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(storageService.app instanceof AppService).to.equal(true);
    // @ts-ignore
    expect(storageService.Api instanceof ApiService).to.equal(true);
  });

  it('#info', async () => {
    const result = await storageService.info('xxx');
    expect(result).to.eql({
      method: 'GET',
      endpoint: '/',
      params: { id: 'xxx' },
    });
  });

  it('#upload', async () => {
    const result = await storageService.upload({
      name: 'file1.txt',
      size: 1000,
      base64Data: '<base64Data>',
    }, 'me', 'filex');
    expect(result).to.eql({
      method: 'POST',
      endpoint: '/',
      params: {},
      body: {
        fileResource: {
          name: 'file1.txt',
          size: 1000,
          base64Data: '<base64Data>',
        },
        customFolder: 'me',
        rename: 'filex',
      },
    });
  });

});

describe('(Storage) methods', () => {

  it('#storage (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;
    expect(
      storage.bind(null),
    ).to.throw('No app for storage component.');
  });

  it('#storage (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Storage: 'An Storage instance' }),
    };

    const result = storage();

    expect(result).to.equal('An Storage instance');
  });

  it('#storage (app has no .Storage)', () => {
    const result = storage(new AppService({ backendUrl: '' }));
    expect(result instanceof StorageService).to.equal(true);
  });

});