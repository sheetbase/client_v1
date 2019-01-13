import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import ky from 'kyx';

import { ApiService } from '../src/lib/api/api.service';

const apiService = new ApiService({ backendUrl: '' });

let kyGetStub: sinon.SinonStub;
let kyPostStub: sinon.SinonStub;
let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    kyGetStub = sinon.stub(ky, 'get');
    kyPostStub = sinon.stub(ky, 'post');
    apiGetStub = sinon.stub(apiService, 'get');
    apiPostStub = sinon.stub(apiService, 'post');
}

function restoreStubs() {
    kyGetStub.restore();
    kyPostStub.restore();
    apiGetStub.restore();
    apiPostStub.restore();
}

describe('(Api) Api service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, query) => {
            return { method: 'GET', endpoint, query };
        });
        apiPostStub.callsFake(async (endpoint, query, body) => {
            return { method: 'POST', endpoint, query, body };
        });
    });

    afterEach(() => restoreStubs());

    it('#buildEndpoint', () => {
        const result1 = apiService.buildEndpoint();
        const result2 = apiService.buildEndpoint('xxx');
        const result3 = apiService.buildEndpoint('xxx/abc'); // deeper
        expect(result1).to.equal('/');
        expect(result2).to.equal('/xxx');
        expect(result3).to.equal('/xxx/abc', 'depper');
    });

    it('#buildEndpoint (correct slashs)', () => {
        const result1 = apiService.buildEndpoint('/xxx');
        const result2 = apiService.buildEndpoint('xxx/');
        const result3 = apiService.buildEndpoint('/xxx/');
        expect(result1).to.equal('/xxx', 'begining /');
        expect(result2).to.equal('/xxx', 'ending /');
        expect(result3).to.equal('/xxx', 'both /');
    });

    it('#buildEndpoint (has baseEndpoint)', () => {
        const apiService1 = new ApiService({ backendUrl: '' }, {
            endpoint: '123',
        });
        const apiService2 = new ApiService({ backendUrl: '' }, {
            endpoint: '/123',
        });
        const apiService3 = new ApiService({ backendUrl: '' }, {
            endpoint: '123/',
        });
        const apiService4 = new ApiService({ backendUrl: '' }, {
            endpoint: '/123/',
        });
        const result1 = apiService1.buildEndpoint();
        const result2 = apiService1.buildEndpoint('/');
        const result3 = apiService1.buildEndpoint('xxx');
        const result4 = apiService2.buildEndpoint();
        const result5 = apiService3.buildEndpoint();
        const result6 = apiService4.buildEndpoint();
        expect(result1).to.equal('/123', 'api 1, empty');
        expect(result2).to.equal('/123', 'api 1, a slash');
        expect(result3).to.equal('/123/xxx');
        expect(result4).to.equal('/123', 'api 2');
        expect(result5).to.equal('/123', 'api 3');
        expect(result6).to.equal('/123', 'api 4');
    });

    it('#buildQuery', () => {
        const result1 = apiService.buildQuery();
        const result2 = apiService.buildQuery({ x: 1 });
        const result3 = apiService.buildQuery({ a: 1, b: 2 });
        expect(result1).to.equal('');
        expect(result2).to.equal('x=1');
        expect(result3).to.equal('a=1&b=2');
    });

    it('#buildQuery (has predefinedQuery)', () => {
        const apiService = new ApiService({ backendUrl: '' }, {
            query: { a: 1 },
        });

        const result1 = apiService.buildQuery();
        const result2 = apiService.buildQuery({ x: 1 });
        const result3 = apiService.buildQuery({ a: 'xxx' }); // overide
        expect(result1).to.equal('a=1');
        expect(result2).to.equal('a=1&x=1');
        expect(result3).to.equal('a=xxx');
    });

    it('#buildQuery (has apiKey)', () => {
        const apiService = new ApiService({
            backendUrl: '',
            apiKey: 'xxx',
        });
        const result1 = apiService.buildQuery();
        const result2 = apiService.buildQuery({ x: 1 });
        expect(result1).to.equal('apiKey=xxx');
        expect(result2).to.equal('apiKey=xxx&x=1');
    });

    it('#buildBody', () => {
        const result1 = apiService.buildBody();
        const result2 = apiService.buildBody({ x: 1 });
        const result3 = apiService.buildBody({ a: 1, b: 2 });
        expect(result1).to.eql({});
        expect(result2).to.eql({ x: 1 });
        expect(result3).to.eql({ a: 1, b: 2 });
    });

    it('#buildBody (has predefinedBody)', () => {
        const apiService = new ApiService({ backendUrl: '' }, {
            body: { a: 1 },
        });

        const result1 = apiService.buildBody();
        const result2 = apiService.buildBody({ x: 1 });
        const result3 = apiService.buildBody({ a: 'xxx' }); // overide
        expect(result1).to.eql({ a: 1 });
        expect(result2).to.eql({ a: 1, x: 1 });
        expect(result3).to.eql({ a: 'xxx' });
    });

    it('#buildUrl', () => {
        const result1 = apiService.buildUrl();
        const result2 = apiService.buildUrl('/xxx');
        const result3 = apiService.buildUrl(null, 'a=1');
        const result4 = apiService.buildUrl('/xxx', 'a=1');
        expect(result1).to.equal('');
        expect(result2).to.equal('?e=/xxx');
        expect(result3).to.equal('?a=1');
        expect(result4).to.equal('?e=/xxx&a=1');
    });

    it('#instance', () => {
        const result = apiService.instance();
        expect(result instanceof ApiService).to.equal(true);
    });

    it('#request ', async () => {
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

    it('#get ', async () => {
        kyGetStub.onFirstCall().returns({
            json: async () => ({ data: true }),
        });
        apiGetStub.restore();

        const result = await apiService.get();
        expect(result).to.equal(true);
    });

    it('#post ', async () => {
        kyPostStub.onFirstCall().returns({
            json: async () => ({ data: true }),
        });
        apiPostStub.restore();

        const result = await apiService.post();
        expect(result).to.equal(true);
    });

    it('#put ', async () => {
        const result = await apiService.put('/');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: { method: 'PUT' },
            body: {},
        });
    });

    it('#patch ', async () => {
        const result = await apiService.patch('/', { a: 1 });
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: { method: 'PATCH', a: 1 },
            body: {},
        });
    });

    it('#delete ', async () => {
        const result = await apiService.delete('/', {}, { b: 2 });
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: { method: 'DELETE' },
            body: { b: 2 },
        });
    });

});