import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import ky from 'kyx';

import { ApiService } from '../src/lib/api/api.service';

const fakeApp: any = (options) => ({ options: () => options });
const apiService = new ApiService(fakeApp({ backendUrl: '' }));

let kyGetStub: sinon.SinonStub;
let kyPostStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    kyGetStub = sinon.stub(ky, 'get');
    kyPostStub = sinon.stub(ky, 'post');
    apiPostStub = sinon.stub(apiService, 'post');
}

function restoreStubs() {
    kyGetStub.restore();
    kyPostStub.restore();
    apiPostStub.restore();
}

describe('(Api) Api service', () => {

    beforeEach(() => buildStubs());
    afterEach(() => restoreStubs());

    it('.app should work', () => {
        // @ts-ignore
        expect(!!apiService.app).to.equal(true);
    });

    it('#buildUrl should work', async () => {
        // @ts-ignore
        const result1 = await apiService.buildUrl();
        // @ts-ignore
        const result2 = await apiService.buildUrl('/');
        // @ts-ignore
        const result3 = await apiService.buildUrl(null, { x: 1 });
        // @ts-ignore
        const result4 = await apiService.buildUrl('/', { x: 1 });
        // @ts-ignore
        const result5 = await apiService.buildUrl('/x', { a: 1, b: 2 });
        expect(result1).to.equal('');
        expect(result2).to.equal('?e=/');
        expect(result3).to.equal('?x=1');
        expect(result4).to.equal('?e=/&x=1');
        expect(result5).to.equal('?e=/x&a=1&b=2');
    });

    it('#buildUrl should work (has apiKey)', async () => {
        const apiService = new ApiService(fakeApp({ backendUrl: '', apiKey: 'xxx' }));
        // @ts-ignore
        const result = await apiService.buildUrl();
        expect(result).to.equal('?apiKey=xxx');
    });

    it('#get should work ', async () => {
        kyGetStub.onFirstCall().returns({
            json: async () => true,
        });

        const result = await apiService.get();
        expect(result).to.equal(true);
    });

    it('#post should work ', async () => {
        kyPostStub.onFirstCall().returns({
            json: async () => true,
        });
        apiPostStub.restore();

        const result = await apiService.post();
        expect(result).to.equal(true);
    });

    it('#put should work ', async () => {
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { endpoint, params, body };
        });

        const result = await apiService.put('/');
        expect(result).to.eql({
            endpoint: '/',
            params: { method: 'PUT' },
            body: {},
        });
    });

    it('#patch should work ', async () => {
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { endpoint, params, body };
        });

        const result = await apiService.patch('/', { a: 1 });
        expect(result).to.eql({
            endpoint: '/',
            params: { method: 'PATCH', a: 1 },
            body: {},
        });
    });

    it('#delete should work ', async () => {
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { endpoint, params, body };
        });

        const result = await apiService.delete('/', {}, { b: 2 });
        expect(result).to.eql({
            endpoint: '/',
            params: { method: 'DELETE' },
            body: { b: 2 },
        });
    });

});