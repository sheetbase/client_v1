import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

import { FetchService } from '../src/lib/fetch/fetch.service';
import { fetch } from '../src/lib/fetch/index';

// FetchService
let fetchService: FetchService;

let fetchStub: sinon.SinonStub;

function before() {
  fetchService = new FetchService(
    new MockedAppService() as any,
  );
  fetchStub = sinon.stub(fetchService, 'fetch')
  .callsFake(async (...args) => args as any);
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

  it('#fetch (error)', async () => {
    fetchStub.restore();

    global['fetch'] = async () => ({
      ok: false,
    });

    let error: Error;
    try {
      await fetchService.fetch('/');
    } catch (err) {
      error = err;
    }
    expect(error.message).equal('Fetch failed!');
  });

  it('#fetch (json)', async () => {
    fetchStub.restore();

    global['fetch'] = async () => ({
      ok: true,
      json: async () => ({ a: 1, b: 2 }),
    });

    const result = await fetchService.fetch('/');
    expect(result).eql({ a: 1, b: 2 });
  });

  it('#fetch (text)', async () => {
    fetchStub.restore();

    global['fetch'] = async () => ({
      ok: true,
      text: async () => 'xxx',
    });

    const result = await fetchService.fetch('/', {}, false);
    expect(result).equal('xxx');
  });

  it('#get', async () => {
    const cacheArgs: any = await fetchService.get('/');
    const fetchArgs = await cacheArgs[1]();
    expect(cacheArgs[0]).equal('fetch_6666cd76f96956469e7be39d750cc7d9');
    expect(cacheArgs[2]).equal(0);
    expect(fetchArgs).eql([
      '/',
      { method: 'GET' },
      true,
    ]);
  });

  it('#post', async () => {
    const result = await fetchService.post('/', {
      body: JSON.stringify({ a: 1 }),
    });
    expect(result).eql([
      '/',
      { method: 'POST', body: '{"a":1}' },
    ]);
  });

  it('#put', async () => {
    const result = await fetchService.put('/');
    expect(result).eql([
      '/',
      { method: 'PUT' },
    ]);
  });

  it('#patch', async () => {
    const result = await fetchService.patch('/');
    expect(result).eql([
      '/',
      { method: 'PATCH' },
    ]);
  });

  it('#delete', async () => {
    const result = await fetchService.delete('/');
    expect(result).eql([
      '/',
      { method: 'DELETE' },
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