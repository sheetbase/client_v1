import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { FetchService } from '../src/lib/fetch/fetch.service';
import { fetch } from '../src/lib/fetch/index';

// mocked AppService
class MockedAppService {
  options = {};
  constructor() {}
  Cache = {
    get: (...args) => args,
  } as any;
}

// FetchService
let fetchService: FetchService;

let fetchStub: sinon.SinonStub;

function before() {
  fetchService = new FetchService(
    new MockedAppService() as any,
  );
  fetchStub = sinon.stub(fetchService, 'fetch')
  .callsFake((...args) => args as any);
}

function after() {
  fetchStub.restore();
}

describe('(Fetch) Fetch service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(fetchService.app instanceof MockedAppService).equal(true);
  });

  it('#fetch (default values)', async () => {
    fetchStub.restore();

    const cacheArgs: any = await fetchService.fetch('/');
    expect(cacheArgs[0]).equal('fetch_6666cd76f96956469e7be39d750cc7d9');
    expect(cacheArgs[1] instanceof Function).equal(true);
    expect(cacheArgs[2]).equal(0);
  });

  it('#fetch (custom values)', async () => {
    fetchStub.restore();

    const cacheArgs: any = await fetchService.fetch('/', {}, {
      cacheTime: 10,
      cacheKey: 'xxx',
    });
    expect(cacheArgs[0]).equal('xxx');
    expect(cacheArgs[1] instanceof Function).equal(true);
    expect(cacheArgs[2]).equal(10);
  });

  it('#fetch (error)', async () => {
    fetchStub.restore();

    const cacheArgs: any = await fetchService.fetch('/');
    const handler: any = cacheArgs[1];

    global['fetch'] = async () => ({
      ok: false,
    });

    let error: Error;
    try {
      await handler();
    } catch (err) {
      error = err;
    }
    expect(error.message).equal('Fetch failed!');
  });

  it('#fetch (json)', async () => {
    fetchStub.restore();

    const cacheArgs: any = await fetchService.fetch('/');
    const handler: any = cacheArgs[1];

    global['fetch'] = async () => ({
      ok: true,
      json: async () => ({ a: 1, b: 2 }),
    });

    const result = await handler();
    expect(result).eql({ a: 1, b: 2 });
  });

  it('#fetch (text)', async () => {
    fetchStub.restore();

    const cacheArgs: any = await fetchService.fetch('/', {}, { json: false });
    const handler: any = cacheArgs[1];

    global['fetch'] = async () => ({
      ok: true,
      text: async () => 'xxx',
    });

    const result = await handler();
    expect(result).equal('xxx');
  });

  it('#get', async () => {
    const result = await fetchService.get('/', { headers: {} }, { json: false });
    expect(result).eql([
      '/',
      { headers: {}, method: 'GET' },
      { json: false },
    ]);
  });

  it('#post', async () => {
    const result = await fetchService.post('/');
    expect(result).eql([
      '/',
      { method: 'POST' },
      {},
    ]);
  });

  it('#put', async () => {
    const result = await fetchService.put('/');
    expect(result).eql([
      '/',
      { method: 'PUT' },
      {},
    ]);
  });

  it('#patch', async () => {
    const result = await fetchService.patch('/');
    expect(result).eql([
      '/',
      { method: 'PATCH' },
      {},
    ]);
  });

  it('#delete', async () => {
    const result = await fetchService.delete('/');
    expect(result).eql([
      '/',
      { method: 'DELETE' },
      {},
    ]);
  });

});

describe('(Fetch) methods', () => {

  it('#fetch (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;

    expect(
      fetch.bind(null),
    ).throw('No app for fetch component.');
  });

  it('#fetch (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Fetch: 'An Fetch instance' }),
    };

    const result = fetch();

    expect(result).equal('An Fetch instance');
  });

  it('#fetch (app has no .Fetch)', () => {
    const result = fetch({
      options: {},
      Localstorage: {
        instance: () => null,
      },
    } as any);

    expect(result instanceof FetchService).equal(true);
  });

});