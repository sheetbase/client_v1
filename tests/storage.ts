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
    apiGetStub = sinon.stub(storageService.apiService, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(storageService.apiService, 'post');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
}

describe('(Storage) Storage service', () => {

    beforeEach(() => buildStubs());
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

    it('.apiService should be initiated', () => {
        // @ts-ignore
        expect(storageService.apiService instanceof ApiService).to.equal(true);
    });

    it('#endpoint should work', () => {
        const result = storageService.endpoint();
        expect(result).to.equal('/storage');
    });

    it('#info should work', async () => {
        apiGetStub.callsFake(async (endpoint, params) => {
            return { endpoint, params };
        });

        const result = await storageService.info('xxx');
        expect(result).to.eql({
            endpoint: '/storage',
            params: { id: 'xxx' },
        });
    });

    it('#upload should work', async () => {
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { endpoint, params, body };
        });

        const result = await storageService.upload({
            name: 'file1.txt',
            size: 1000,
            base64Data: '<base64Data>',
        }, 'me', 'filex');
        expect(result).to.eql({
            endpoint: '/storage',
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