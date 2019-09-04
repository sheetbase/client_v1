import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';

import { ApiError, ApiService } from '../src/lib/api/api.service';
import { api } from '../src/lib/api/index';

let apiService: ApiService;

let apiFetchStub: sinon.SinonStub;
let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function before() {
  apiService = new ApiService(
    new AppService({ backendUrl: '' }),
  );
  // @ts-ignore
  apiFetchStub = sinon.stub(apiService, 'fetch');
  apiGetStub = sinon.stub(apiService, 'get');
  apiPostStub = sinon.stub(apiService, 'post');
  //
  apiGetStub.callsFake(async (endpoint, query) => {
    return { method: 'GET', endpoint, query };
  });
  apiPostStub.callsFake(async (endpoint, query, body) => {
    return { method: 'POST', endpoint, query, body };
  });
}

function after() {
  apiFetchStub.restore();
  apiGetStub.restore();
  apiPostStub.restore();
}

describe('(Api) Api service', () => {

  beforeEach(before);
  afterEach(after);

  it('ApiError', () => {
    const error = { error: true, code: 'xxx', message: 'Route error ...' };
    const result = new ApiError(error);
    expect(result.name).equal('ApiError');
    expect(result.message).equal('Route error ...');
    expect(result.error).eql(error);
  });

  const INSTANCE_DATA = {
    endpoint: 'xxx',
    query: { a: 1 },
    body: { b: 2 },
    beforeHooks: [async data => data],
  };

  it('properties', () => {
    expect(apiService.app instanceof AppService).equal(true, '.app');
    // @ts-ignore
    expect(apiService.baseEndpoint).equal('', '.baseEndpoint');
    // @ts-ignore
    expect(apiService.predefinedQuery).eql({}, '.predefinedQuery');
    // @ts-ignore
    expect(apiService.predefinedBody).eql({}, '.predefinedBody');
    // @ts-ignore
    expect(apiService.beforeRequestHooks).eql([], '.beforeRequestHooks');
  });

  it('properties (custom data)', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '' }),
      INSTANCE_DATA,
    );

    // @ts-ignore
    expect(apiService.baseEndpoint).equal('xxx');
    // @ts-ignore
    expect(apiService.predefinedQuery).eql({ a: 1 });
    // @ts-ignore
    expect(apiService.predefinedBody).eql({ b: 2 });
    // @ts-ignore
    expect(apiService.beforeRequestHooks.length).equal(1);
  });

  it('properties (query has key)', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '', apiKey: 'xxx' }),
    );

    // @ts-ignore
    expect(apiService.predefinedQuery).eql({ key: 'xxx' });
  });

  it('#extend', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: 'xxx' }),
    );

    const result = apiService.extend();

    expect(result instanceof ApiService).equal(true, 'instance of api service');
    expect(
      result.app instanceof AppService &&
      result.app.options.backendUrl === 'xxx',
    ).equal(true, 'inherit .app');
  });

  it('#extend (also inherit data)', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '' }),
      INSTANCE_DATA,
    );

    const result = apiService.extend();

    // @ts-ignore
    expect(result.baseEndpoint).equal('xxx');
    // @ts-ignore
    expect(result.predefinedQuery).eql({ a: 1 });
    // @ts-ignore
    expect(result.predefinedBody).eql({ b: 2 });
    // @ts-ignore
    expect(result.beforeRequestHooks.length).equal(1);
  });

  it('#setData', () => {
    const result = apiService.setData(INSTANCE_DATA);

    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.baseEndpoint).equal('xxx');
    // @ts-ignore
    expect(result.predefinedQuery).eql({ a: 1 });
    // @ts-ignore
    expect(result.predefinedBody).eql({ b: 2 });
    // @ts-ignore
    expect(result.beforeRequestHooks.length).equal(1);
  });

  it('#setEndpoint', () => {
    const result = apiService.setEndpoint('xxx');

    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.baseEndpoint).equal('xxx');
  });

  it('#addQuery', () => {
    const result = apiService.addQuery({ a: 1 });
    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.predefinedQuery).eql({ a: 1 });
  });

  it('#addBody', () => {
    const result = apiService.addBody({ b: 2 });

    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.predefinedBody).eql({ b: 2 });
  });

  it('#addBeforeHooks (1 hook)', () => {
    const result = apiService.addBeforeHooks(async data => data);

    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.beforeRequestHooks.length).equal(1);
  });

  it('#addBeforeHooks (multiple)', () => {
    const result = apiService.addBeforeHooks([
      async data => data, async data => data,
    ]);

    expect(result instanceof ApiService).equal(true);
    // @ts-ignore
    expect(result.beforeRequestHooks.length).equal(2);
  });

  it('#buildEndpoint', () => {
    // @ts-ignore
    const result1 = apiService.buildEndpoint();
    // @ts-ignore
    const result2 = apiService.buildEndpoint('xxx');
    // @ts-ignore
    const result3 = apiService.buildEndpoint('xxx/abc'); // deeper

    expect(result1).equal('/');
    expect(result2).equal('/xxx');
    expect(result3).equal('/xxx/abc', 'depper');
  });

  it('#buildEndpoint (correct slashs)', () => {
    // @ts-ignore
    const result1 = apiService.buildEndpoint('/xxx');
    // @ts-ignore
    const result2 = apiService.buildEndpoint('xxx/');
    // @ts-ignore
    const result3 = apiService.buildEndpoint('/xxx/');

    expect(result1).equal('/xxx', 'begining /');
    expect(result2).equal('/xxx', 'ending /');
    expect(result3).equal('/xxx', 'both /');
  });

  it('#buildEndpoint (has baseEndpoint)', () => {
    const apiService1 = new ApiService(new AppService({ backendUrl: '' }));
    const apiService2 = new ApiService(new AppService({ backendUrl: '' }));
    const apiService3 = new ApiService(new AppService({ backendUrl: '' }));
    const apiService4 = new ApiService(new AppService({ backendUrl: '' }));
    apiService1.setData({ endpoint: '123' });
    apiService2.setData({ endpoint: '/123' });
    apiService3.setData({ endpoint: '123/' });
    apiService4.setData({ endpoint: '/123' });

    // @ts-ignore
    const result1 = apiService1.buildEndpoint();
    // @ts-ignore
    const result2 = apiService1.buildEndpoint('/');
    // @ts-ignore
    const result3 = apiService1.buildEndpoint('xxx');
    // @ts-ignore
    const result4 = apiService2.buildEndpoint();
    // @ts-ignore
    const result5 = apiService3.buildEndpoint();
    // @ts-ignore
    const result6 = apiService4.buildEndpoint();

    expect(result1).equal('/123', 'api 1, empty');
    expect(result2).equal('/123', 'api 1, a slash');
    expect(result3).equal('/123/xxx');
    expect(result4).equal('/123', 'api 2');
    expect(result5).equal('/123', 'api 3');
    expect(result6).equal('/123', 'api 4');
  });

  it('#buildQuery', () => {
    // @ts-ignore
    const result1 = apiService.buildQuery();
    // @ts-ignore
    const result2 = apiService.buildQuery({ x: 1 });
    // @ts-ignore
    const result3 = apiService.buildQuery({ a: 1, b: 2 });

    expect(result1).equal('');
    expect(result2).equal('x=1');
    expect(result3).equal('a=1&b=2');
  });

  it('#buildQuery (has predefinedQuery)', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '' }),
    )
      .setData({
        query: { a: 1 },
      });

    // @ts-ignore
    const result1 = apiService.buildQuery();
    // @ts-ignore
    const result2 = apiService.buildQuery({ x: 1 });
    // @ts-ignore
    const result3 = apiService.buildQuery({ a: 'xxx' }); // overide

    expect(result1).equal('a=1');
    expect(result2).equal('a=1&x=1');
    expect(result3).equal('a=xxx');
  });

  it('#buildBody', () => {
    // @ts-ignore
    const result1 = apiService.buildBody();
    // @ts-ignore
    const result2 = apiService.buildBody({ x: 1 });
    // @ts-ignore
    const result3 = apiService.buildBody({ a: 1, b: 2 });

    expect(result1).eql({});
    expect(result2).eql({ x: 1 });
    expect(result3).eql({ a: 1, b: 2 });
  });

  it('#buildBody (has predefinedBody)', () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '' }),
    ).setData({
      body: { a: 1 },
    });

    // @ts-ignore
    const result1 = apiService.buildBody();
    // @ts-ignore
    const result2 = apiService.buildBody({ x: 1 });
    // @ts-ignore
    const result3 = apiService.buildBody({ a: 'xxx' }); // overide

    expect(result1).eql({ a: 1 });
    expect(result2).eql({ a: 1, x: 1 });
    expect(result3).eql({ a: 'xxx' });
  });

  it('#buildUrl', () => {
    // @ts-ignore
    const result1 = apiService.buildUrl();
    // @ts-ignore
    const result2 = apiService.buildUrl('/xxx');
    // @ts-ignore
    const result3 = apiService.buildUrl(null, 'a=1');
    // @ts-ignore
    const result4 = apiService.buildUrl('/xxx', 'a=1');

    expect(result1).equal('');
    expect(result2).equal('?e=/xxx');
    expect(result3).equal('?a=1');
    expect(result4).equal('?e=/xxx&a=1');
  });

  it('#runHooks', async () => {
    const apiService = new ApiService(
      new AppService({ backendUrl: '' }),
      {
        beforeHooks: [
          async data => {
            data.endpoint = '/abc1'; // override endpoint
            data.query['xxx'] = 'xxx'; // add a query
            return data;
          },
          async data => {
            data.body['xxx'] = (data.body['xxx'] as string).toUpperCase(); // modify body
            return data;
          },
          async data => {
            data.endpoint = '/abc'; // me win
            return data;
          },
        ],
      },
    );

    // @ts-ignore
    const result = await apiService.runHooks('before', {
      endpoint: '/123', // = /abc
      query: { a: 1 }, // { a: 1, xxx: 'xxx' }
      body: { xxx: 'me uppercase' }, // { xxx: 'ME UPPERCASE' }
    });

    expect(result).eql({
      endpoint: '/abc',
      query: { a: 1, xxx: 'xxx' },
      body: { xxx: 'ME UPPERCASE' },
    });
  });

  it('#fetch (not ok)', async () => {
    apiFetchStub.restore();
    global['fetch'] = async () => ({ ok: false });

    let error: Error;
    try {
      // @ts-ignore
      await apiService.fetch('/');
    } catch (err) {
      error = err;
    }

    expect(error.message).equal('API fetch failed.');
  });

  it('#fetch (reponse error)', async () => {
    apiFetchStub.restore();
    global['fetch'] = async () => ({
      ok: true,
      json: async () => ({ error: true }),
    });

    let error: any;
    try {
      // @ts-ignore
      await apiService.fetch('/');
    } catch (err) {
      error = err;
    }

    expect(error.name).equal('ApiError');
  });

  it('#fetch', async () => {
    apiFetchStub.restore();
    global['fetch'] = async () => ({
      ok: true,
      json: async () => ({ success: true, data: { a: 1, b: 2 } }),
    });

    // @ts-ignore
    const result = await apiService.fetch('/');

    expect(result).eql({ a: 1, b: 2 });
  });

  it('#request', async () => {
    const result1 = await apiService.request();
    const result2 = await apiService.request({
      method: 'GET',
    });
    const result3 = await apiService.request({
      method: 'POST',
    });
    const result4 = await apiService.request({
      method: 'PUT', endpoint: '/xxx', query: { a: 1 }, body: { b: 2 },
    });
    expect(result1).eql({
      method: 'GET', endpoint: '/', query: {},
    });
    expect(result2).eql({
      method: 'GET', endpoint: '/', query: {},
    });
    expect(result3).eql({
      method: 'POST', endpoint: '/', query: {}, body: {},
    });
    expect(result4).eql({
      method: 'POST', endpoint: '/xxx', query: { method: 'PUT', a: 1 }, body: { b: 2 },
    });
  });

  it('#get', async () => {
    apiFetchStub.onFirstCall().returns({ a: 1, b: 2 });
    apiGetStub.restore();

    const result = await apiService.get();
    expect(result[1]).eql({ a: 1, b: 2 });
  });

  it('#post', async () => {
    apiFetchStub.onFirstCall().returns({ a: 1, b: 2 });
    apiPostStub.restore();

    const result = await apiService.post();
    expect(result).eql({ a: 1, b: 2 });
  });

  it('#put', async () => {
    const result = await apiService.put('/');
    expect(result).eql({
      method: 'POST',
      endpoint: '/',
      query: { method: 'PUT' },
      body: {},
    });
  });

  it('#patch', async () => {
    const result = await apiService.patch('/', { a: 1 });
    expect(result).eql({
      method: 'POST',
      endpoint: '/',
      query: { method: 'PATCH', a: 1 },
      body: {},
    });
  });

  it('#delete', async () => {
    const result = await apiService.delete('/', {}, { b: 2 });
    expect(result).eql({
      method: 'POST',
      endpoint: '/',
      query: { method: 'DELETE' },
      body: { b: 2 },
    });
  });

});

describe('(Api) methods', () => {

  it('#api (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;

    expect(
      api.bind(null),
    ).throw('No app for api component.');
  });

  it('#api (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Api: 'An Api instance' }),
    };

    const result = api();

    expect(result).equal('An Api instance');
  });

  it('#api (app has no .Api)', () => {
    const result = api({ options: {} } as any);

    expect(result instanceof ApiService).equal(true);
  });

});