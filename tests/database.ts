import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { DatabaseService } from '../src/lib/database/database.service';
import { ApiService } from '../src/lib/api/api.service';

const databaseService = new DatabaseService({ backendUrl: '' });

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;
let apiDeleteStub: sinon.SinonStub;

function buildStubs() {
    // @ts-ignore
    apiGetStub = sinon.stub(databaseService.apiService, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(databaseService.apiService, 'post');
    // @ts-ignore
    apiDeleteStub = sinon.stub(databaseService.apiService, 'delete');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
    apiDeleteStub.restore();
}

describe('(Database) Database service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, params) => {
            return { method: 'GET', endpoint, params };
        });
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { method: 'POST', endpoint, params, body };
        });
        apiDeleteStub.callsFake(async (endpoint, params, body) => {
            return { method: 'DELETE', endpoint, params, body };
        });
    });
    afterEach(() => restoreStubs());

    it('.options should have default values', () => {
        // @ts-ignore
        expect(databaseService.options.databaseEndpoint).to.equal('database');
    });

    it('.options should have custom values', () => {
        const databaseService = new DatabaseService({
            backendUrl: '',
            databaseEndpoint: 'xxx',
        });
        // @ts-ignore
        expect(databaseService.options.databaseEndpoint).to.equal('xxx');
    });

    it('.apiService should be initiated', () => {
        // @ts-ignore
        expect(databaseService.apiService instanceof ApiService).to.equal(true);
    });

    it('#endpoint should work', () => {
        const result = databaseService.endpoint();
        expect(result).to.equal('/database');
    });

    it('#parseIdOrDocOrCondition should work', () => {
        // @ts-ignore
        const result1 = databaseService.parseIdOrDocOrCondition(1);
        // @ts-ignore
        const result2 = databaseService.parseIdOrDocOrCondition('xxx');
        // @ts-ignore
        const result3 = databaseService.parseIdOrDocOrCondition({ a: 'xxx' });
        expect(result1).to.eql({ id: 1 });
        expect(result2).to.eql({ doc: 'xxx' });
        expect(result3).to.eql({ where: 'a', equal: 'xxx' });
    });

    it('#all should work', async () => {
        const result = await databaseService.all('foo');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { table: 'foo' },
        });
    });

    it('#item should work', async () => {
        const result1 = await databaseService.item('foo', 1);
        const result2 = await databaseService.item('foo', { name: 'xxx' });
        expect(result1).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { table: 'foo', id: 1 },
        });
        expect(result2).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { table: 'foo', where: 'name', equal: 'xxx' },
        });
    });

    it('#delete should work', async () => {
        const result1 = await databaseService.delete('foo', 1);
        const result2 = await databaseService.delete('foo', { name: 'xxx' });
        expect(result1).to.eql({
            method: 'DELETE',
            endpoint: '/database',
            params: {},
            body: { table: 'foo', id: 1 },
        });
        expect(result2).to.eql({
            method: 'DELETE',
            endpoint: '/database',
            params: {},
            body: { table: 'foo', where: 'name', equal: 'xxx' },
        });
    });

    it('#collection should work', async () => {
        const result1 = await databaseService.collection('foo');
        const result2 = await databaseService.collection('foo', true);
        expect(result1).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { collection: 'foo', type: 'list' },
        });
        expect(result2).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { collection: 'foo', type: 'object' },
        });
    });

    it('#doc should work', async () => {
        const result = await databaseService.doc('foo', 'foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { collection: 'foo', doc: 'foo-1' },
        });
    });

    it('#object should work', async () => {
        const result = await databaseService.object('/foo/foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { path: '/foo/foo-1', type: 'object' },
        });
    });

    it('#list should work', async () => {
        const result = await databaseService.list('/foo/foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database',
            params: { path: '/foo/foo-1', type: 'list' },
        });
    });

    it('#query should work', async () => {
        const result = await databaseService.query('foo', { limit: 10 });
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database/query',
            params: { table: 'foo', limit: 10 },
        });
    });

    it('#deepQuery should work', async () => {
        const result = await databaseService.deepQuery('foo', { limitToFirst: 10 });
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database/query',
            params: { collection: 'foo', limitToFirst: 10 },
        });
    });

    it('#search should work', async () => {
        const result = await databaseService.search('foo', 'xxx');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/database/search',
            params: { table: 'foo', collection: 'foo', s: 'xxx' },
        });
    });

    it('#updateDoc should work', async () => {
        const result1 = await databaseService.updateDoc('foo', { a: 1 }, 1);
        const result2 = await databaseService.updateDoc('foo', { a: 1 }, 'xxx');
        const result3 = await databaseService.updateDoc('foo', { a: 1 }, { name: 'xxx' });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { collection: 'foo', data: { a: 1 }, id: 1 },
        });
        expect(result2).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { collection: 'foo', data: { a: 1 }, doc: 'xxx' },
        });
        expect(result3).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { collection: 'foo', data: { a: 1 }, where: 'name', equal: 'xxx' },
        });
    });

    it('#update should work', async () => {
        const result1 = await databaseService.update('foo', { a: 1 }, 1);
        const result2 = await databaseService.update('foo', { a: 1 }, { name: 'xxx' });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { table: 'foo', data: { a: 1 }, id: 1 },
        });
        expect(result2).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { table: 'foo', data: { a: 1 }, where: 'name', equal: 'xxx' },
        });
    });

    it('#updates should work', async () => {
        const result1 = await databaseService.updates({ '/foo/foo-1': null });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/database',
            params: {},
            body: { updates: { '/foo/foo-1': null } },
        });
    });

});
