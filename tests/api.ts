import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import ky from 'kyx';

import { initializeApp } from '../src/sheetbase';

const app = initializeApp({ backendUrl: '' }, 'Api');

let kyGetStub: sinon.SinonStub;
let kyPostStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    kyGetStub = sinon.stub(ky, 'get');
    kyPostStub = sinon.stub(ky, 'post');
    apiPostStub = sinon.stub(app.Api, 'post');
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
        expect(!!app.Api.app).to.equal(true);
    });

    it('#buildUrl should work', async () => {
        // @ts-ignore
        const result1 = await app.Api.buildUrl();
        // @ts-ignore
        const result2 = await app.Api.buildUrl('/');
        // @ts-ignore
        const result3 = await app.Api.buildUrl(null, { x: 1 });
        // @ts-ignore
        const result4 = await app.Api.buildUrl('/', { x: 1 });
        // @ts-ignore
        const result5 = await app.Api.buildUrl('/x', { a: 1, b: 2 });
        expect(result1).to.equal('');
        expect(result2).to.equal('?e=/');
        expect(result3).to.equal('?x=1');
        expect(result4).to.equal('?e=/&x=1');
        expect(result5).to.equal('?e=/x&a=1&b=2');
    });

    it('#buildUrl should work (has apiKey)', async () => {
        const app = initializeApp({ backendUrl: '', apiKey: 'xxx' }, 'Api2');
        // @ts-ignore
        const result = await app.Api.buildUrl();
        expect(result).to.equal('?apiKey=xxx');
    });

    it('#get should work ', async () => {
        kyGetStub.onFirstCall().returns({
            json: async () => true,
        });

        const result = await app.Api.get();
        expect(result).to.equal(true);
    });

    it('#post should work ', async () => {
        kyPostStub.onFirstCall().returns({
            json: async () => true,
        });
        apiPostStub.restore();

        const result = await app.Api.post();
        expect(result).to.equal(true);
    });

    it('#put should work ', async () => {
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { endpoint, params, body };
        });

        const result = await app.Api.put('/');
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

        const result = await app.Api.patch('/', { a: 1 });
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

        const result = await app.Api.delete('/', {}, { b: 2 });
        expect(result).to.eql({
            endpoint: '/',
            params: { method: 'DELETE' },
            body: { b: 2 },
        });
    });

});