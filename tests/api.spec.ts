import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import * as lscache from 'lscache';
import { AppService } from '../src/lib/app/app.service';

import { ApiService } from '../src/lib/api/api.service';
import { api } from '../src/lib/api/index';

let apiService: ApiService;

let cacheGetStub: sinon.SinonStub;
let apiFetchStub: sinon.SinonStub;
let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    cacheGetStub = sinon.stub(lscache, 'get');
    // @ts-ignore
    apiFetchStub = sinon.stub(apiService, 'fetch');
    apiGetStub = sinon.stub(apiService, 'get');
    apiPostStub = sinon.stub(apiService, 'post');
}

function restoreStubs() {
    cacheGetStub.restore();
    apiFetchStub.restore();
    apiGetStub.restore();
    apiPostStub.restore();
}

describe('(Api) Api service', () => {

    beforeEach(() => {
        apiService = new ApiService(
            new AppService({ backendUrl: '' }),
        );
        buildStubs();
        apiGetStub.callsFake(async (endpoint, query) => {
            return { method: 'GET', endpoint, query };
        });
        apiPostStub.callsFake(async (endpoint, query, body) => {
            return { method: 'POST', endpoint, query, body };
        });
    });

    afterEach(() => restoreStubs());

    const INSTANCE_DATA = {
        endpoint: 'xxx',
        query: { a: 1 },
        body: { b: 2 },
        beforeHooks: [async data => data],
    };

    it('properties', () => {
        expect(apiService.app instanceof AppService).to.equal(true, '.app');
        // @ts-ignore
        expect(apiService.baseEndpoint).to.equal('', '.baseEndpoint');
        // @ts-ignore
        expect(apiService.predefinedQuery).to.eql({}, '.predefinedQuery');
        // @ts-ignore
        expect(apiService.predefinedBody).to.eql({}, '.predefinedBody');
        // @ts-ignore
        expect(apiService.beforeRequestHooks).to.eql([], '.beforeRequestHooks');
    });

    it('properties (custom data)', () => {
        const apiService = new ApiService(
            new AppService({ backendUrl: '' }),
            INSTANCE_DATA,
        );

        // @ts-ignore
        expect(apiService.baseEndpoint).to.equal('xxx');
        // @ts-ignore
        expect(apiService.predefinedQuery).to.eql({ a: 1 });
        // @ts-ignore
        expect(apiService.predefinedBody).to.eql({ b: 2 });
        // @ts-ignore
        expect(apiService.beforeRequestHooks.length).to.equal(1);
    });

    it('properties (query has apiKey)', () => {
        const apiService = new ApiService(
            new AppService({ backendUrl: '', apiKey: 'xxx' }),
        );

        // @ts-ignore
        expect(apiService.predefinedQuery).to.eql({ apiKey: 'xxx' });
    });

    it('#extend', () => {
        const apiService = new ApiService(
            new AppService({ backendUrl: 'xxx' }),
        );

        const result = apiService.extend();

        expect(result instanceof ApiService).to.equal(true, 'instance of api service');
        expect(
            result.app instanceof AppService &&
            result.app.options.backendUrl === 'xxx',
        ).to.equal(true, 'inherit .app');
    });

    it('#extend (also inherit data)', () => {
        const apiService = new ApiService(
            new AppService({ backendUrl: '' }),
            INSTANCE_DATA,
        );

        const result = apiService.extend();

        // @ts-ignore
        expect(result.baseEndpoint).to.equal('xxx');
        // @ts-ignore
        expect(result.predefinedQuery).to.eql({ a: 1 });
        // @ts-ignore
        expect(result.predefinedBody).to.eql({ b: 2 });
        // @ts-ignore
        expect(result.beforeRequestHooks.length).to.equal(1);
    });

    it('#setData', () => {
        const result = apiService.setData(INSTANCE_DATA);

        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.baseEndpoint).to.equal('xxx');
        // @ts-ignore
        expect(result.predefinedQuery).to.eql({ a: 1 });
        // @ts-ignore
        expect(result.predefinedBody).to.eql({ b: 2 });
        // @ts-ignore
        expect(result.beforeRequestHooks.length).to.equal(1);
    });

    it('#setEndpoint', () => {
        const result = apiService.setEndpoint('xxx');

        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.baseEndpoint).to.equal('xxx');
    });

    it('#addQuery', () => {
        const result = apiService.addQuery({ a: 1 });
        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.predefinedQuery).to.eql({ a: 1 });
    });

    it('#addBody', () => {
        const result = apiService.addBody({ b: 2 });

        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.predefinedBody).to.eql({ b: 2 });
    });

    it('#addBeforeHooks (1 hook)', () => {
        const result = apiService.addBeforeHooks(async data => data);

        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.beforeRequestHooks.length).to.equal(1);
    });

    it('#addBeforeHooks (multiple)', () => {
        const result = apiService.addBeforeHooks([
            async data => data, async data => data,
        ]);

        expect(result instanceof ApiService).to.equal(true);
        // @ts-ignore
        expect(result.beforeRequestHooks.length).to.equal(2);
    });

    it('#buildEndpoint', () => {
        // @ts-ignore
        const result1 = apiService.buildEndpoint();
        // @ts-ignore
        const result2 = apiService.buildEndpoint('xxx');
        // @ts-ignore
        const result3 = apiService.buildEndpoint('xxx/abc'); // deeper

        expect(result1).to.equal('/');
        expect(result2).to.equal('/xxx');
        expect(result3).to.equal('/xxx/abc', 'depper');
    });

    it('#buildEndpoint (correct slashs)', () => {
        // @ts-ignore
        const result1 = apiService.buildEndpoint('/xxx');
        // @ts-ignore
        const result2 = apiService.buildEndpoint('xxx/');
        // @ts-ignore
        const result3 = apiService.buildEndpoint('/xxx/');

        expect(result1).to.equal('/xxx', 'begining /');
        expect(result2).to.equal('/xxx', 'ending /');
        expect(result3).to.equal('/xxx', 'both /');
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

        expect(result1).to.equal('/123', 'api 1, empty');
        expect(result2).to.equal('/123', 'api 1, a slash');
        expect(result3).to.equal('/123/xxx');
        expect(result4).to.equal('/123', 'api 2');
        expect(result5).to.equal('/123', 'api 3');
        expect(result6).to.equal('/123', 'api 4');
    });

    it('#buildQuery', () => {
        // @ts-ignore
        const result1 = apiService.buildQuery();
        // @ts-ignore
        const result2 = apiService.buildQuery({ x: 1 });
        // @ts-ignore
        const result3 = apiService.buildQuery({ a: 1, b: 2 });

        expect(result1).to.equal('');
        expect(result2).to.equal('x=1');
        expect(result3).to.equal('a=1&b=2');
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

        expect(result1).to.equal('a=1');
        expect(result2).to.equal('a=1&x=1');
        expect(result3).to.equal('a=xxx');
    });

    it('#buildBody', () => {
        // @ts-ignore
        const result1 = apiService.buildBody();
        // @ts-ignore
        const result2 = apiService.buildBody({ x: 1 });
        // @ts-ignore
        const result3 = apiService.buildBody({ a: 1, b: 2 });

        expect(result1).to.eql({});
        expect(result2).to.eql({ x: 1 });
        expect(result3).to.eql({ a: 1, b: 2 });
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

        expect(result1).to.eql({ a: 1 });
        expect(result2).to.eql({ a: 1, x: 1 });
        expect(result3).to.eql({ a: 'xxx' });
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

        expect(result1).to.equal('');
        expect(result2).to.equal('?e=/xxx');
        expect(result3).to.equal('?a=1');
        expect(result4).to.equal('?e=/xxx&a=1');
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

        expect(result).to.eql({
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

        expect(error.message).to.equal('API fetch failed.');
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

        expect(error.name).to.equal('ApiError');
    });

    it('#fetch', async () => {
        apiFetchStub.restore();
        global['fetch'] = async () => ({
            ok: true,
            json: async () => ({ success: true, data: { a: 1, b: 2 } }),
        });

        // @ts-ignore
        const result = await apiService.fetch('/');

        expect(result).to.eql({ a: 1, b: 2 });
    });

    it('#cache (no cache)', async () => {
        // @ts-ignore
        const result = await apiService.cache('xxx', 1, async () => 'xxx');
        expect(result).to.equal('xxx');
    });

    it('#cache (cache, no local)', async () => {
        cacheGetStub.onFirstCall().returns(null);
        // @ts-ignore
        const result = await apiService.cache('xxx', 1, async () => 'xxx');
        expect(result).to.equal('xxx');
    });

    it('#cache (cache, has local, time)', async () => {
        cacheGetStub.onFirstCall().returns({ a: 1 });
        // @ts-ignore
        const result = await apiService.cache('xxx', 1, async () => 'xxx');
        expect(result).to.eql({ a: 1 });
    });

    it('#cache (cache, has local, cacheTime from options)', async () => {
        cacheGetStub.onFirstCall().returns({ a: 1 });
        apiService = new ApiService(
            new AppService({ backendUrl: '', cacheTime: 1 }),
        );

        // @ts-ignore
        const result = await apiService.cache('xxx', 0, async () => 'xxx');
        expect(result).to.eql({ a: 1 });
    });

    it('#cache (no cache, cacheTime from options but overridden by time = -1)', async () => {
        cacheGetStub.onFirstCall().returns({ a: 1 });
        apiService = new ApiService(
            new AppService({ backendUrl: '', cacheTime: 1 }),
        );

        // @ts-ignore
        const result = await apiService.cache('xxx', -1, async () => 'xxx');
        expect(result).to.equal('xxx');
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
        expect(result1).to.eql({
            method: 'GET', endpoint: '/', query: {},
        });
        expect(result2).to.eql({
            method: 'GET', endpoint: '/', query: {},
        });
        expect(result3).to.eql({
            method: 'POST', endpoint: '/', query: {}, body: {},
        });
        expect(result4).to.eql({
            method: 'POST', endpoint: '/xxx', query: { method: 'PUT', a: 1 }, body: { b: 2 },
        });
    });

    it('#get', async () => {
        apiFetchStub.onFirstCall().returns({ a: 1, b: 2 });
        apiGetStub.restore();

        const result = await apiService.get();
        expect(result).to.eql({ a: 1, b: 2 });
    });

    it('#post', async () => {
        apiFetchStub.onFirstCall().returns({ a: 1, b: 2 });
        apiPostStub.restore();

        const result = await apiService.post();
        expect(result).to.eql({ a: 1, b: 2 });
    });

    it('#put', async () => {
        const result = await apiService.put('/');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: { method: 'PUT' },
            body: {},
        });
    });

    it('#patch', async () => {
        const result = await apiService.patch('/', { a: 1 });
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: { method: 'PATCH', a: 1 },
            body: {},
        });
    });

    it('#delete', async () => {
        const result = await apiService.delete('/', {}, { b: 2 });
        expect(result).to.eql({
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
        ).to.throw('No app for api component.');
    });

    it('#api (no app, default app)', () => {
        window['$$$SHEETBASE_APPS'] = {
            getApp: () => ({ Api: 'An Api instance' }),
        };

        const result = api();

        expect(result).to.equal('An Api instance');
    });

    it('#api (app has no .Api)', () => {
        const result = api({ options: {} } as any);

        expect(result instanceof ApiService).to.equal(true);
    });

});