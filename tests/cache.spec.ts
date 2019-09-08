import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService, MockedLocalstorageService } from './_mocks';

import { CacheService } from '../src/lib/cache/cache.service';
import { cache } from '../src/lib/cache/index';

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
  // @ts-ignore
  localstorageGetStub = sinon.stub(cacheService.Localstorage, 'get');
  // @ts-ignore
  localstorageSetStub = sinon.stub(cacheService.Localstorage, 'set');
  // @ts-ignore
  localstorageRemoveStub = sinon.stub(cacheService.Localstorage, 'remove');
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
    expect(
      cacheService.app.Localstorage instanceof MockedLocalstorageService,
    ).equal(true, 'has local storage');
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

  it('#set (time = 0)', async () => {
    setStub.restore();

    let error: Error;
    try {
      await cacheService.set('xxx', { a: 1 });
    } catch (err) {
      error = err;
    }

    expect(error.message).equal('Not caching when time is 0. Set time globally or use the argument.');
  });

  it('#set', async () => {
    setStub.restore();

    let expirationResult;
    let valueResult;
    localstorageSetStub.onFirstCall().callsFake((...args) => expirationResult = args);
    localstorageSetStub.onSecondCall().callsFake((...args) => valueResult = args);

    const result = await cacheService.set('xxx', { a: 1 }, 10000);
    expect(expirationResult[0]).equal('xxx__expiration');
    expect(typeof expirationResult[1] === 'number').equal(true);
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
    expect(key).equal('xxx__expiration');
    expect(result).equal(null);
  });

  it('#get (expired)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns(
      new Date().getTime() - 10000, // expired 10s earlier
    );

    const result = await cacheService.get('xxx');
    expect(result).equal(null);
  });

  it('#get (not expired)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns(
      new Date().getTime() + 10000, // expired 10s later
    );
    localstorageGetStub.onSecondCall().returns('abc'); // value in cached

    const result = await cacheService.get('xxx');
    expect(result).equal('abc');
  });

  it('#get (expired, with refresher but error)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns(
      new Date().getTime() - 10000, // expired 10s earlier
    );
    localstorageGetStub.onSecondCall().returns('abc'); // value in cached

    const result = await cacheService.get(
      'xxx',
      async () => {
        throw new Error('...'); // simulate refreshing error
      },
    );
    expect(result).equal('abc'); // return cached value anyway
  });

  it('#get (expired, with refresher, no cache time)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns(
      new Date().getTime() - 10000, // expired 10s earlier
    );
    localstorageGetStub.onSecondCall().returns('abc'); // value in cached
    let setArgs;
    setStub.callsFake((...args) => {
      setArgs = args;
      return args[1]; // value
    });

    const result = await cacheService.get(
      'xxx', async () => 'ABC',
    );
    expect(setArgs).eql(undefined); // not set cache
    expect(result).equal('ABC');
  });

  it('#get (expired, with refresher)', async () => {
    getStub.restore();

    localstorageGetStub.onFirstCall().returns(
      new Date().getTime() - 10000, // expired 10s earlier
    );
    localstorageGetStub.onSecondCall().returns('abc'); // value in cached
    let setArgs;
    setStub.callsFake((...args) => {
      setArgs = args;
      return args[1]; // value
    });

    const result = await cacheService.get(
      'xxx', async () => 'ABC', 10000,
    );
    expect(setArgs).eql([ 'xxx', 'ABC', 10000 ]);
    expect(result).equal('ABC');
  });

  it.skip('#get (key builder)');

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
      return new Date().getTime() + 10000; // 10s later
    });
    const removeResult = [];
    localstorageRemoveStub.onFirstCall().callsFake((...args) => removeResult[0] = args);
    localstorageRemoveStub.onSecondCall().callsFake((...args) => removeResult[1] = args);

    const handler: any = await cacheService.flushExpired();
    const result = await handler('xxx__expiration');
    expect(key).equal('xxx__expiration');
    expect(removeResult).eql([]);
  });

  it('#flushExpired (no expiration value)', async () => {
    localstorageGetStub.returns(null);
    const removeResult = [];
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
    localstorageGetStub.returns(new Date().getTime() - 10000); // 10s earlier
    const removeResult = [];
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