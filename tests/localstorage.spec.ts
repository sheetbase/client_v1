import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { localforageCreateInstanceStub } from './_libs';

import { AppService } from '../src/lib/app/app.service';

import { LocalstorageService } from '../src/lib/localstorage/localstorage.service';
import { localstorage } from '../src/lib/localstorage/index';

// localforage
let localForageconfigs: any;
class StubedLocalforageInstance {
  constructor () {}
  getItem(...args) {
    return args;
  }
  setItem(...args) {
    return args;
  }
  removeItem(...args) {
    return args;
  }
  clear() {
    return '#clear';
  }
  keys() {
    return ['k1', 'k2', 'k3'];
  }
  iterate(...args) {
    return args;
  }
}
localforageCreateInstanceStub.callsFake(cf => {
  localForageconfigs = cf;
  return new StubedLocalforageInstance() as any;
});

// service
let localstorageService: LocalstorageService;
let iterateKeysStub: sinon.SinonStub;
let removeStub: sinon.SinonStub;
function before() {
  localstorageService = new LocalstorageService(
    new AppService(),
  );
  iterateKeysStub = sinon.stub(localstorageService, 'iterateKeys');
  removeStub = sinon.stub(localstorageService, 'remove');
}
function after() {
  iterateKeysStub.restore();
  removeStub.restore();
}

describe('(Localstorage) Localstorage service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(localstorageService.app instanceof AppService).equal(true);
    expect(localstorageService.localforage instanceof StubedLocalforageInstance).equal(true);
  });

  it('default storage configs', () => {
    expect(localForageconfigs).eql({
      name: 'SHEETBASE_STORAGE',
    });
  });

  it('#instance', () => {
    const result = localstorageService.instance({
      name: 'xxx',
    });
    expect(result.app instanceof AppService).equal(true);
    expect(result.localforage instanceof StubedLocalforageInstance).equal(true);
    expect(localForageconfigs).eql({
      name: 'xxx',
    });
  });

  it('#set', async () => {
    const result = await localstorageService.set('xxx', { a: 1 });
    expect(result).eql([
      'xxx',
      { a: 1 },
    ]);
  });

  it('#get', async () => {
    const result = await localstorageService.get('xxx');
    expect(result).eql(['xxx']);
  });

  it('#iterate', async () => {
    const result = await localstorageService.iterate('handler()' as any);
    expect(result).eql(['handler()']);
  });

  it('#iterateKeys', async () => {
    iterateKeysStub.restore();

    const result = [];
    await localstorageService.iterateKeys(async (key, i) => {
      result.push([ key, i ]);
    });
    expect(result).eql([
      ['k1', 0],
      ['k2', 1],
      ['k3', 2],
    ]);
  });

  it('#remove', async () => {
    removeStub.restore();

    const result = await localstorageService.remove('xxx');
    expect(result).eql(['xxx']);
  });

  it('#removeBulk', async () => {
    const result = []; // list of input keys
    removeStub.callsFake(k => result.push(k));

    await localstorageService.removeBulk(['k1', 'k2']);
    expect(result).eql(['k1', 'k2']);
  });

  it('#removeByPrefix', async () => {
    const result = []; // list of input keys
    iterateKeysStub.callsFake(async (handler) => {
      const keys = ['a1', 'a2', 'b1', 'c1'];
      for (let i = 0; i < keys.length; i++) {
        await handler(keys[i], i);
      }
    });
    removeStub.callsFake(k => result.push(k));

    await localstorageService.removeByPrefix('a');
    expect(result).eql(['a1', 'a2']);
  });

  it('#removeBySuffix', async () => {
    const result = []; // list of input keys
    iterateKeysStub.callsFake(async (handler) => {
      const keys = ['az', 'a1', 'bz', 'c1'];
      for (let i = 0; i < keys.length; i++) {
        await handler(keys[i], i);
      }
    });
    removeStub.callsFake(k => result.push(k));

    await localstorageService.removeBySuffix('z');
    expect(result).eql(['az', 'bz']);
  });

  it('#clear', async () => {
    const result = await localstorageService.clear();
    expect(result).equal('#clear');
  });

  it('#keys', async () => {
    const result = await localstorageService.keys();
    expect(result).eql(['k1', 'k2', 'k3']);
  });

});

describe('(Localstorage) methods', () => {

  it('#localstorage (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;

    expect(
      localstorage.bind(null),
    ).throw('No app for localstorage component.');
  });

  it('#localstorage (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Localstorage: 'An Localstorage instance' }),
    };

    const result = localstorage();

    expect(result).equal('An Localstorage instance');
  });

  it('#localstorage (app has no .Localstorage)', () => {
    const result = localstorage({ options: {} } as any);

    expect(result instanceof LocalstorageService).equal(true);
  });

});