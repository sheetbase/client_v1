import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

import { ApiError, ApiService } from '../src/lib/api/api.service';
import { api } from '../src/lib/api/index';

let apiService: ApiService;

let fetchFetchStub: sinon.SinonStub;
let fetchStub: sinon.SinonStub;
let getStub: sinon.SinonStub;
let postStub: sinon.SinonStub;
let putStub: sinon.SinonStub;
let loggingStub: sinon.SinonStub;

function before() {
  apiService = new ApiService(
    new MockedAppService() as any,
  );
  fetchFetchStub = sinon.stub(apiService.app.Fetch, 'fetch');
  // @ts-ignore
  fetchStub = sinon.stub(apiService, 'fetch');
  getStub = sinon.stub(apiService, 'get')
  .callsFake(async (endpoint, query) => {
    return { method: 'GET', endpoint, query };
  });
  postStub = sinon.stub(apiService, 'post')
  .callsFake(async (endpoint, query, body) => {
    return { method: 'POST', endpoint, query, body };
  });
  putStub = sinon.stub(apiService, 'put')
  .callsFake(async (...args) => args as any);
  loggingStub = sinon.stub(apiService, 'logging')
  .callsFake(async (...args) => args as any);
}

function after() {
  fetchFetchStub.restore();
  fetchStub.restore();
  getStub.restore();
  postStub.restore();
  putStub.restore();
  loggingStub.restore();
}

const INSTANCE_DATA = {
  endpoint: 'xxx',
  query: { a: 1 },
  body: { b: 2 },
  beforeHooks: [async data => data],
};

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

  it('properties', () => {
    expect(apiService.app instanceof MockedAppService).equal(true, '.app');
    // @ts-ignore
    expect(apiService.baseEndpoint).equal('', '.baseEndpoint');
    // @ts-ignore
    expect(apiService.predefinedQuery).eql({}, '.predefinedQuery');
    // @ts-ignore
    expect(apiService.predefinedBody).eql({}, '.predefinedBody');
    // @ts-ignore
    expect(apiService.beforeRequestHooks).eql([], '.beforeRequestHooks');
    // @ts-ignore
    expect(apiService.loggingEndpoint).equal('logging', '.loggingEndpoint');
  });

  it('properties (custom data)', () => {
    const apiService = new ApiService(
      new MockedAppService() as any,
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
      new MockedAppService({ apiKey: 'xxx' }) as any,
    );

    // @ts-ignore
    expect(apiService.predefinedQuery).eql({ key: 'xxx' });
  });

  it('#extend', () => {
    const apiService = new ApiService(
      new MockedAppService({ backendUrl: 'xxx' }) as any,
    );

    const result = apiService.extend();
    expect(result instanceof ApiService).equal(true, 'instance of api service');
    expect(
      result.app instanceof MockedAppService &&
      result.app.options.backendUrl === 'xxx',
    ).equal(true, 'inherit .app');
  });

  it('#extend (also inherit data)', () => {
    const apiService = new ApiService(
      new MockedAppService() as any,
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
    const apiService1 = new ApiService(new MockedAppService() as any);
    const apiService2 = new ApiService(new MockedAppService() as any);
    const apiService3 = new ApiService(new MockedAppService() as any);
    const apiService4 = new ApiService(new MockedAppService() as any);
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
      new MockedAppService() as any,
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
      new MockedAppService() as any,
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
      new MockedAppService() as any,
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

  it('#fetch (check args)', async () => {
    fetchStub.restore();

    let fetchArgs;
    fetchFetchStub.callsFake(async (...args) => fetchArgs = args);
    // @ts-ignore
    await apiService.fetch('/', { method: 'GET' });
    expect(fetchArgs).eql([
      '/',
      { method: 'GET' },
      true,
    ]);
  });

  it('#fetch (reponse error)', async () => {
    fetchStub.restore();

    fetchFetchStub.returns({ error: true });
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
    fetchStub.restore();

    fetchFetchStub.returns({ success: true, data: { a: 1, b: 2 } });
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
    getStub.restore();

    fetchStub.returns({ a: 1, b: 2 });

    const cacheGetArgs = await apiService.get();
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('api_37d56450d19e402bbb121be9779d6a54');
    expect(cacheGetArgs[2]).equal(0);
    expect(result).eql({ a: 1, b: 2 });
  });

  it('#post', async () => {
    fetchStub.onFirstCall().returns({ a: 1, b: 2 });
    postStub.restore();

    const result = await apiService.post();
    expect(result).eql({ a: 1, b: 2 });
  });

  it('#put', async () => {
    putStub.restore();

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

  it('#system', async () => {
    const result = await apiService.system();
    expect(result).eql({
      method: 'GET',
      endpoint: '/system',
      query: undefined,
    });
  });

  it('#logging', async () => {
    loggingStub.restore();

    const result = await apiService.logging('xxx');
    expect(result).eql([
      '/logging',
      {},
      {
        value: 'xxx',
        level: 'DEBUG',
      },
    ]);
  });

  it('#log', async () => {
    const result = await apiService.log('xxx');
    expect(result).eql(['xxx', 'DEBUG']);
  });

  it('#info', async () => {
    const result = await apiService.info('xxx');
    expect(result).eql(['xxx', 'INFO']);
  });

  it('#warn', async () => {
    const result = await apiService.warn('xxx');
    expect(result).eql(['xxx', 'WARNING']);
  });

  it('#error', async () => {
    const result = await apiService.error('xxx');
    expect(result).eql(['xxx', 'ERROR']);
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