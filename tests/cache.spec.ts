import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { CacheService } from '../src/lib/cache/cache.service';
import { cache } from '../src/lib/cache/index';

// mocked AppService
class MockedAppService {
  options = {};
  constructor() {}
  Localstorage = {
    instance: () => this.Localstorage,
    get: (...args) => args,
    set: (...args) => args,
    iterate: handler => handler,
    iterateKeys: handler => handler,
    remove: (...args) => args,
    removeByPrefix: (...args) => args,
    removeBySuffix: (...args) => args,
    clear: () => '#clear',
  } as any;
}

// CacheService
let cacheService: CacheService;

let localstorageGetStub: sinon.SinonStub;
let localstorageSetStub: sinon.SinonStub;
let localstorageRemoveStub: sinon.SinonStub;
let getStub: sinon.SinonStub;
let setStub: sinon.SinonStub;
let removeStub: sinon.SinonStub;

function before() {
  cacheService = new CacheService(
    new MockedAppService() as any,
  );
  localstorageGetStub = sinon.stub(cacheService.app.Localstorage, 'get');
  localstorageSetStub = sinon.stub(cacheService.app.Localstorage, 'set');
  localstorageRemoveStub = sinon.stub(cacheService.app.Localstorage, 'remove');
  getStub = sinon.stub(cacheService, 'get');
  setStub = sinon.stub(cacheService, 'set');
  removeStub = sinon.stub(cacheService, 'remove');
}

function after() {
  localstorageGetStub.restore();
  localstorageSetStub.restore();
  localstorageRemoveStub.restore();
  getStub.restore();
  setStub.restore();
  removeStub.restore();
}

describe('(Cache) Cache service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(
      cacheService.app instanceof MockedAppService,
    ).equal(true, 'has app service');
    expect(!!cacheService.app.Localstorage).equal(true, 'has local storage');
  });

  it('default localstorage configs', () => {
    let configs: any;
    const app = new MockedAppService() as any;
    app.Localstorage = {
      instance: cf => configs = cf as any,
    } as any;
    const cacheService = new CacheService(app);

    expect(configs).eql({ name: 'SHEETBASE_CACHE' });
  });

  it('#instance', () => {
    let configs: any;
    const app = new MockedAppService() as any;
    app.Localstorage = {
      instance: cf => configs = cf as any,
    } as any;
    const cacheService = new CacheService(app, { name: 'xxx' });

    expect(
      cacheService.app instanceof MockedAppService,
    ).equal(true, 'has app service');
    expect(!!cacheService.app.Localstorage).equal(true, 'has local storage');
    expect(configs).eql({ name: 'xxx' });
  });

  it('#cacheTime (no global)', () => {
    const result1 = cacheService.cacheTime(0);
    const result2 = cacheService.cacheTime(1);
    expect(result1).equal(0);
    expect(result2).equal(1);
  });

  it('#cacheTime (has global)', () => {
    const cacheService = new CacheService(
      new MockedAppService() as any,
    );
    cacheService.app.options.cacheTime = 1;

    const result1 = cacheService.cacheTime(-1);
    const result2 = cacheService.cacheTime(0);
    const result3 = cacheService.cacheTime(3);
    expect(result1).equal(0);
    expect(result2).equal(1);
    expect(result3).equal(3);
  });

  it('#set', async () => {
    setStub.restore();

    let expirationResult;
    let valueResult;
    localstorageSetStub.onFirstCall().callsFake((...args) => expirationResult = args);
    localstorageSetStub.onSecondCall().callsFake((...args) => valueResult = args);

    const result = await cacheService.set('xxx', { a: 1 });
    expect(expirationResult[0]).equal('xxx__expiration');
    expect((new Date().getTime() - expirationResult[1]) < 10).equal(true);
    expect(valueResult).eql(['xxx', { a: 1 }]);
    expect(result).eql(['xxx', { a: 1 }]);
  });

  it('#get (no cached)', async () => {
    getStub.restore();

    let key;
    localstorageGetStub.onFirstCall().callsFake(k => {
      key = k;
      return null;
    });
    const result = await cacheService.get('xxx');

    expect(key).equal('xxx');
    expect(result).equal(null);
  });

  it('#get (alwaysData)', async () => {
    getStub.restore();

    localstorageGetStub.returns(null);

    const result = await cacheService.get('xxx', true);
    expect(result).eql({ data: null, expired: true });
  });

  it('#get (has cached, expired - no expiration key/value)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns('abc');
    let key;
    localstorageGetStub.onSecondCall().callsFake(k => {
      key = k;
      return null; // no expiration key/value
    });

    const result = await cacheService.get('xxx');
    expect(key).equal('xxx__expiration');
    expect(result).equal(null);
  });

  it('#get (has cached, expired)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns('abc');
    localstorageGetStub.onSecondCall().returns(new Date().getTime() - 10); // expired 10s earlier

    const result = await cacheService.get('xxx');
    expect(result).equal(null);
  });

  it('#get (has cached, not expired)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns('abc');
    localstorageGetStub.onSecondCall().returns(new Date().getTime() + 10); // expired 10s later

    const result = await cacheService.get('xxx');
    expect(result).equal('abc');
  });

  it('#getRefresh ( no cached)', async () => {
    let getResult;
    getStub.callsFake((...args) => {
      getResult = args;
      return { expired: true, data: null };
    });

    const result = await cacheService.getRefresh('xxx', null);
    expect(getResult).eql(['xxx', true], 'correct args');
    expect(result).equal(null);
  });

  it('#getRefresh (has cached + not expired)', async () => {
    getStub.returns({ expired: false, data: 'abc' });

    const result = await cacheService.getRefresh('xxx', null);
    expect(result).equal('abc');
  });

  it('#getRefresh (has cached + expired, no refresher)', async () => {
    getStub.returns({ expired: true, data: 'abc' });

    const result = await cacheService.getRefresh('xxx', null);
    expect(result).equal('abc', 'always use cached value anyway');
  });

  it('#getRefresh (has cached + expired, has refresher)', async () => {
    getStub.returns({ expired: true, data: 'abc' });
    let setResult;
    setStub.callsFake((...args) => {
      setResult = args;
      return args[1]; // return data
    });

    const result = await cacheService.getRefresh('xxx', async () => '123');
    expect(setResult).eql(['xxx', '123', 0]);
    expect(result).equal('123');
  });

  it('#iterate', async () => {
    const result = await cacheService.iterate('handler()' as any);
    expect(result).equal('handler()');
  });

  it('#iterateKeys', async () => {
    const result = await cacheService.iterateKeys('handler()' as any);
    expect(result).equal('handler()');
  });

  it('#remove', async () => {
    removeStub.restore();

    let expirationResult;
    let valueResult;
    localstorageRemoveStub.onFirstCall().callsFake((...args) => expirationResult = args);
    localstorageRemoveStub.onSecondCall().callsFake((...args) => valueResult = args);
    const result = await cacheService.remove('xxx');
    expect(expirationResult).eql(['xxx__expiration']);
    expect(valueResult).eql(['xxx']);
    expect(result).eql(['xxx']);
  });

  it('#removeBulk', async () => {
    const keys = [];
    removeStub.callsFake(k => keys.push(k));
    await cacheService.removeBulk(['k1', 'k2', 'k3']);
    expect(keys).eql(['k1', 'k2', 'k3']);
  });

  it('#removeByPrefix', async () => {
    const result = await cacheService.removeByPrefix('a');
    expect(result).eql(['a']);
  });

  it('#removeBySuffix', async () => {
    const result = await cacheService.removeBySuffix('z');
    expect(result).eql(['z']);
  });

  it('#flush', async () => {
    const result = await cacheService.flush();
    expect(result).equal('#clear');
  });

  it('#flushExpired (only check expiration key)', async () => {
    const handler: any = await cacheService.flushExpired();
    const result = await handler('xxx');
    expect(result).equal(undefined);
  });

  it('#flushExpired (not expired)', async () => {
    let key;
    localstorageGetStub.callsFake(k => {
      key = k;
      return new Date().getTime() + 10; // 10s later
    });
    let removeResult = [];
    localstorageRemoveStub.onFirstCall().callsFake((...args) => removeResult[0] = args);
    localstorageRemoveStub.onSecondCall().callsFake((...args) => removeResult[1] = args);

    const handler: any = await cacheService.flushExpired();
    const result = await handler('xxx__expiration');
    expect(key).equal('xxx__expiration');
    expect(removeResult).eql([]);
  });

  it('#flushExpired (no expiration value)', async () => {
    localstorageGetStub.returns(null);
    let removeResult = [];
    localstorageRemoveStub.onFirstCall().callsFake((...args) => removeResult[0] = args);
    localstorageRemoveStub.onSecondCall().callsFake((...args) => removeResult[1] = args);

    const handler: any = await cacheService.flushExpired();
    const result = await handler('xxx__expiration');
    expect(removeResult).eql([
      ['xxx__expiration'],
      ['xxx'],
    ]);
  });

  it('#flushExpired (expired)', async () => {
    localstorageGetStub.returns(new Date().getTime() - 10); // 10s earlier
    let removeResult = [];
    localstorageRemoveStub.onFirstCall().callsFake((...args) => removeResult[0] = args);
    localstorageRemoveStub.onSecondCall().callsFake((...args) => removeResult[1] = args);

    const handler: any = await cacheService.flushExpired();
    const result = await handler('xxx__expiration');
    expect(removeResult).eql([
      ['xxx__expiration'],
      ['xxx'],
    ]);
  });

});

describe('(Cache) methods', () => {

  it('#cache (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;

    expect(
      cache.bind(null),
    ).throw('No app for cache component.');
  });

  it('#cache (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Cache: 'An Cache instance' }),
    };

    const result = cache();

    expect(result).equal('An Cache instance');
  });

  it('#cache (app has no .Cache)', () => {
    const result = cache({
      options: {},
      Localstorage: {
        instance: () => null,
      },
    } as any);

    expect(result instanceof CacheService).equal(true);
  });

});