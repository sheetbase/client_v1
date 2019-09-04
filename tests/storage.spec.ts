import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService, MockedApiService } from './_mocks';

import { StorageService } from '../src/lib/storage/storage.service';
import { storage } from '../src/lib/storage/index';

let storageService: StorageService;

let isValidTypeStub: sinon.SinonStub;
let isValidSizeStub: sinon.SinonStub;
let validateUploadFileStub: sinon.SinonStub;
let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;
let apiPutStub: sinon.SinonStub;
let apiDeleteStub: sinon.SinonStub;

function before() {
  storageService = new StorageService(
    new MockedAppService() as any,
  );
  // @ts-ignore
  isValidTypeStub = sinon.stub(storageService, 'isValidType');
  // @ts-ignore
  isValidSizeStub = sinon.stub(storageService, 'isValidSize');
  // @ts-ignore
  validateUploadFileStub = sinon.stub(storageService, 'validateUploadFile');
  // @ts-ignore
  apiGetStub = sinon.stub(storageService.Api, 'get')
  .callsFake(async (endpoint, params) => {
    return { method: 'GET', endpoint, params };
  });
  // @ts-ignore
  apiPostStub = sinon.stub(storageService.Api, 'post')
  .callsFake(async (endpoint, params, body) => {
    return { method: 'POST', endpoint, params, body };
  });
  // @ts-ignore
  apiPutStub = sinon.stub(storageService.Api, 'put')
  .callsFake(async (endpoint, params, body) => {
    return { method: 'PUT', endpoint, params, body };
  });
  // @ts-ignore
  apiDeleteStub = sinon.stub(storageService.Api, 'delete')
  .callsFake(async (endpoint, params, body) => {
    return { method: 'DELETE', endpoint, params, body };
  });
}

function after() {
  isValidTypeStub.restore();
  isValidSizeStub.restore();
  validateUploadFileStub.restore();
  apiGetStub.restore();
  apiPostStub.restore();
  apiPutStub.restore();
  apiDeleteStub.restore();
}

describe('(Storage) Storage service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(storageService.app instanceof MockedAppService).equal(true);
    // @ts-ignore
    expect(storageService.Api instanceof MockedApiService).equal(true);
  });

  it('endpoint', () => {
    // default
    // @ts-ignore
    expect(storageService.Api.baseEndpoint).equal('storage');
    // custom
    const storageService2 = new StorageService(
      new MockedAppService({
        storageEndpoint: 'xxx',
      }) as any,
    );
    // @ts-ignore
    expect(storageService2.Api.baseEndpoint).equal('xxx');
  });

  it('#base64Parser', async () => {
    // @ts-ignore
    const result = storageService.base64Parser('data:text/plain;base64,Abc=');
    expect(result).eql({
      mimeType: 'text/plain',
      size: 2.25,
      base64Body: 'Abc=',
    });
  });

  it('#isValidType (no allowTypes, all allowed)', () => {
    isValidTypeStub.restore();

    // @ts-ignore
    const result = storageService.isValidType('any');
    expect(result).equal(true);
  });

  it('#isValidType (has allowTypes, not allowed)', () => {
    isValidTypeStub.restore();

    const storageService = new StorageService(
      new MockedAppService({
        storageAllowTypes: ['text/plain'],
      }) as any,
    );
    // @ts-ignore
    const result = storageService.isValidType('text/rich');
    expect(result).equal(false);
  });

  it('#isValidType (has allowTypes, allowed)', () => {
    isValidTypeStub.restore();

    const storageService = new StorageService(
      new MockedAppService({
        storageAllowTypes: ['text/rich'],
      }) as any,
    );
    // @ts-ignore
    const result = storageService.isValidType('text/rich');
    expect(result).equal(true);
  });

  it('#isValidSize (no maxSize or 0, all allowed)', () => {
    isValidSizeStub.restore();

    const storageService1 = new StorageService(
      new MockedAppService({
        storageMaxSize: null,
      }) as any,
    );
    const storageService2 = new StorageService(
      new MockedAppService({
        storageMaxSize: 0,
      }) as any,
    );
    // @ts-ignore
    const result1 = storageService1.isValidSize(100000000); // 100MB
    // @ts-ignore
    const result2 = storageService2.isValidSize(100000000); // 100MB
    expect(result1).equal(true, 'not setted');
    expect(result2).equal(true, '=== 0');
  });

  it('#isValidSize (has maxSize, not allowed)', () => {
    isValidSizeStub.restore();

    const storageService = new StorageService(
      new MockedAppService({
        storageMaxSize: 10,
      }) as any,
    );
    // @ts-ignore
    const result = storageService.isValidSize(11000000); // 11MB
    expect(result).equal(false);
  });

  it('#isValidSize (has maxSize, allowed)', () => {
    isValidSizeStub.restore();

    const storageService = new StorageService(
      new MockedAppService({
        storageMaxSize: 10,
      }) as any,
    );
    // @ts-ignore
    const result = storageService.isValidSize(10000000); // 10MB
    expect(result).equal(true);
  });

  it('#validateUploadFile (missing data)', () => {
    validateUploadFileStub.restore();

    expect(
      // @ts-ignore
      storageService.validateUploadFile.bind(storageService),
    ).throws('Missing upload data.', 'no data');
    expect(
      // @ts-ignore
      storageService.validateUploadFile.bind(storageService, {
        base64Value: 'data:text/plain;base64,Abc=',
      }),
    ).throws('Missing upload data.', 'no name');
    expect(
      // @ts-ignore
      storageService.validateUploadFile.bind(storageService, {
        name: 'xxx.txt',
      }),
    ).throws('Missing upload data.', 'no base 64 value');
  });

  it('#validateUploadFile (invalid type)', () => {
    validateUploadFileStub.restore();

    isValidTypeStub.returns(false);

    expect(
      // @ts-ignore
      storageService.validateUploadFile.bind(storageService, {
        base64Value: 'data:text/plain;base64,Abc=',
        name: 'xxx.txt',
      }),
    ).throws('Invalid file type.');
  });

  it('#validateUploadFile (invalid size)', () => {
    validateUploadFileStub.restore();

    isValidTypeStub.returns(true);
    isValidSizeStub.returns(false);

    expect(
      // @ts-ignore
      storageService.validateUploadFile.bind(storageService, {
        base64Value: 'data:text/plain;base64,Abc=',
        name: 'xxx.txt',
      }),
    ).throws('Invalid file size.');
  });

  it('#validateUploadFile', () => {
    validateUploadFileStub.restore();

    isValidTypeStub.returns(true);
    isValidSizeStub.returns(true);

    // @ts-ignore
    const result = storageService.validateUploadFile({
      base64Value: 'data:text/plain;base64,Abc=',
      name: 'xxx.txt',
    });
    expect(result).equal(undefined);
  });

  it('#info', async () => {
    const result = await storageService.info('xxx');
    expect(result).eql({
      method: 'GET',
      endpoint: '/',
      params: { id: 'xxx' },
    });
  });

  it('#upload (simple)', async () => {
    validateUploadFileStub.returns(null);

    const result = await storageService.upload({} as any);
    expect(result).eql({
      method: 'PUT',
      endpoint: '/',
      params: {},
      body: {
        file: {},
        share: 'PRIVATE',
      },
    });
  });

  it('#upload (simple)', async () => {
    validateUploadFileStub.returns(null);

    const result = await storageService.upload(
      {} as any,
      'folder',
      'HASH',
      'PUBLIC',
    );
    expect(result).eql({
      method: 'PUT',
      endpoint: '/',
      params: {},
      body: {
        file: {},
        folder: 'folder',
        rename: 'HASH',
        share: 'PUBLIC',
      },
    });
  });

  it('#uploadMultiple', async () => {
    validateUploadFileStub.returns(null);

    const resources = [
      {
        file: {} as any,
      },
    ];
    const result = await storageService.uploadMultiple(resources);
    expect(result).eql({
      method: 'PUT',
      endpoint: '/',
      params: {},
      body: {
        files: resources,
      },
    });
  });

  it('#update', async () => {
    const result = await storageService.update('xxx', {});
    expect(result).eql({
      method: 'POST',
      endpoint: '/',
      params: {},
      body: { id: 'xxx', data: {} },
    });
  });

  it('#remove', async () => {
    const result = await storageService.remove('xxx');
    expect(result).eql({
      method: 'DELETE',
      endpoint: '/',
      params: {},
      body: { id: 'xxx' },
    });
  });

  it('#read (invalid type)', async () => {
    isValidTypeStub.returns(false);

    let error: Error;
    try {
      // @ts-ignore
      await storageService.read({});
    } catch (err) {
      error = err;
    }
    expect(error).equal('Invalid file type.');
  });

  it('#read (invalid size)', async () => {
    isValidTypeStub.returns(true);
    isValidSizeStub.returns(false);

    let error: Error;
    try {
      // @ts-ignore
      await storageService.read({});
    } catch (err) {
      error = err;
    }
    expect(error).equal('Invalid file size.');
  });

  it('#read', async () => {
    isValidTypeStub.returns(true);
    isValidSizeStub.returns(true);

    let file;
    // mock FileReader
    class Reader {
      onload(e) {
        return null;
      }
      readAsDataURL(f) {
        file = f;
        this.onload({
          target: {
            result: 'Abc=',
          },
        });
      }
    }
    global['FileReader'] = Reader;

    const _file: any = {
      name: 'xxx.txt',
      size: 123,
      type: 'text/plain',
      lastModified: 1234567890,
    };
    const result = await storageService.read(_file);
    expect(file).eql(_file);
    expect(result).eql({
      _file,
      name: 'xxx.txt',
      size: 123,
      mimeType: 'text/plain',
      lastModified: 1234567890,
      base64Value: 'Abc=',
    });
  });

});

describe('(Storage) methods', () => {

  it('#storage (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;
    expect(
      storage.bind(null),
    ).throw('No app for storage component.');
  });

  it('#storage (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Storage: 'An Storage instance' }),
    };

    const result = storage();

    expect(result).equal('An Storage instance');
  });

  it('#storage (app has no .Storage)', () => {
    const result = storage(new MockedAppService() as any);
    expect(result instanceof StorageService).equal(true);
  });

});