import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { StorageService } from '../src/lib/storage/storage.service';
import { ApiService } from '../src/lib/api/api.service';

const storageService = new StorageService({ backendUrl: '' });

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    // @ts-ignore
    apiGetStub = sinon.stub(storageService.Api, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(storageService.Api, 'post');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
}

describe('(Storage) Storage service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, params) => {
            return { method: 'GET', endpoint, params };
        });
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { method: 'POST', endpoint, params, body };
        });
    });
    afterEach(() => restoreStubs());

    it('.options should have default values', () => {
        // @ts-ignore
        expect(storageService.options.storageEndpoint).to.equal('storage');
    });

    it('.options should have custom values', () => {
        const storageService = new StorageService({
            backendUrl: '',
            storageEndpoint: 'xxx',
        });
        // @ts-ignore
        expect(storageService.options.storageEndpoint).to.equal('xxx');
    });

    it('.Api should be initiated', () => {
        // @ts-ignore
        expect(storageService.Api instanceof ApiService).to.equal(true);
    });

    it('#info', async () => {
        const result = await storageService.info('xxx');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            params: { id: 'xxx' },
        });
    });

    it('#upload', async () => {
        const result = await storageService.upload({
            name: 'file1.txt',
            size: 1000,
            base64Data: '<base64Data>',
        }, 'me', 'filex');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            params: {},
            body: {
                fileResource: {
                    name: 'file1.txt',
                    size: 1000,
                    base64Data: '<base64Data>',
                },
                customFolder: 'me',
                rename: 'filex',
            },
        });
    });

});