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

    it('#buildQuery', () => {
        const result1 = apiService.buildQuery();
        const result2 = apiService.buildQuery({ x: 1 });
        const result3 = apiService.buildQuery({ a: 1, b: 2 });
        expect(result1).to.equal('');
        expect(result2).to.equal('x=1');
        expect(result3).to.equal('a=1&b=2');
    });

    it('#buildQuery (has apiKey)', () => {
        const apiService = new ApiService({
            backendUrl: '',
            apiKey: 'xxx',
        });
        const result = apiService.buildQuery();
        expect(result).to.equal('apiKey=xxx');
    });

    it('#buildBody', () => {

    });

    it('#buildUrl', () => {
        const result1 = apiService.buildUrl();
        const result2 = apiService.buildUrl('/');
        expect(result1).to.equal('');
        expect(result2).to.equal('?e=/');
    });

    it('#buildUrl (has baseEndpoint)', () => {

    });

    it('#instance', () => {

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