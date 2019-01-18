import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';
import { ApiService } from '../src/lib/api/api.service';

import { DatabaseService } from '../src/lib/database/database.service';
import { database } from '../src/lib/database/index';

const databaseService = new DatabaseService(
    new AppService({ backendUrl: '' }),
);

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;
let apiDeleteStub: sinon.SinonStub;

function buildStubs() {
    // @ts-ignore
    apiGetStub = sinon.stub(databaseService.Api, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(databaseService.Api, 'post');
    // @ts-ignore
    apiDeleteStub = sinon.stub(databaseService.Api, 'delete');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
    apiDeleteStub.restore();
}

describe('(Database) Database service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, query) => {
            return { method: 'GET', endpoint, query };
        });
        apiPostStub.callsFake(async (endpoint, query, body) => {
            return { method: 'POST', endpoint, query, body };
        });
        apiDeleteStub.callsFake(async (endpoint, query, body) => {
            return { method: 'DELETE', endpoint, query, body };
        });
    });
    afterEach(() => restoreStubs());

    it('properties', () => {
        expect(databaseService.app instanceof AppService).to.equal(true);
        // @ts-ignore
        expect(databaseService.Api instanceof ApiService).to.equal(true);
    });

    it('#convertFinder', () => {
        // @ts-ignore
        const result1 = databaseService.convertFinder(1);
        // @ts-ignore
        const result2 = databaseService.convertFinder('xxx');
        // @ts-ignore
        const result3 = databaseService.convertFinder({ a: 'xxx' });
        expect(result1).to.eql({ id: 1 });
        expect(result2).to.eql({ doc: 'xxx' });
        expect(result3).to.eql({ where: 'a', equal: 'xxx' });
    });

    it('#all', async () => {
        const result = await databaseService.all('foo');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { table: 'foo' },
        });
    });

    it('#item', async () => {
        const result1 = await databaseService.item('foo', 1);
        const result2 = await databaseService.item('foo', { name: 'xxx' });
        expect(result1).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { table: 'foo', id: 1 },
        });
        expect(result2).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { table: 'foo', where: 'name', equal: 'xxx' },
        });
    });

    it('#delete', async () => {
        const result1 = await databaseService.delete('foo', 1);
        const result2 = await databaseService.delete('foo', { name: 'xxx' });
        expect(result1).to.eql({
            method: 'DELETE',
            endpoint: '/',
            query: {},
            body: { table: 'foo', id: 1 },
        });
        expect(result2).to.eql({
            method: 'DELETE',
            endpoint: '/',
            query: {},
            body: { table: 'foo', where: 'name', equal: 'xxx' },
        });
    });

    it('#collection', async () => {
        const result1 = await databaseService.collection('foo');
        const result2 = await databaseService.collection('foo', true);
        expect(result1).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { collection: 'foo', type: 'list' },
        });
        expect(result2).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { collection: 'foo', type: 'object' },
        });
    });

    it('#doc', async () => {
        const result = await databaseService.doc('foo', 'foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { collection: 'foo', doc: 'foo-1' },
        });
    });

    it('#object', async () => {
        const result = await databaseService.object('/foo/foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { path: '/foo/foo-1', type: 'object' },
        });
    });

    it('#list', async () => {
        const result = await databaseService.list('/foo/foo-1');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { path: '/foo/foo-1', type: 'list' },
        });
    });

    it('#query', async () => {
        const result = await databaseService.query('foo', { limit: 10 });
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/query',
            query: { table: 'foo', limit: 10 },
        });
    });

    it('#deepQuery', async () => {
        const result = await databaseService.deepQuery('foo', { limitToFirst: 10 });
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/query',
            query: { collection: 'foo', limitToFirst: 10 },
        });
    });

    it('#search', async () => {
        const result = await databaseService.search('foo', 'xxx');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/search',
            query: { table: 'foo', collection: 'foo', s: 'xxx' },
        });
    });

    it('#updateDoc', async () => {
        const result1 = await databaseService.updateDoc('foo', { a: 1 }, 1);
        const result2 = await databaseService.updateDoc('foo', { a: 1 }, 'xxx');
        const result3 = await databaseService.updateDoc('foo', { a: 1 }, { name: 'xxx' });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { collection: 'foo', data: { a: 1 }, id: 1 },
        });
        expect(result2).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { collection: 'foo', data: { a: 1 }, doc: 'xxx' },
        });
        expect(result3).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { collection: 'foo', data: { a: 1 }, where: 'name', equal: 'xxx' },
        });
    });

    it('#update', async () => {
        const result1 = await databaseService.update('foo', { a: 1 }, 1);
        const result2 = await databaseService.update('foo', { a: 1 }, { name: 'xxx' });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { table: 'foo', data: { a: 1 }, id: 1 },
        });
        expect(result2).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { table: 'foo', data: { a: 1 }, where: 'name', equal: 'xxx' },
        });
    });

    it('#updates', async () => {
        const result1 = await databaseService.updates({ '/foo/foo-1': null });
        expect(result1).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { updates: { '/foo/foo-1': null } },
        });
    });

});

describe('(Database) methods', () => {

    it('#database (no app, no default app)', () => {
        window['$$$SHEETBASE_APPS'] = null;
        expect(
            database.bind(null),
        ).to.throw('No app for database component.');
    });

    it('#database (no app, default app)', () => {
        window['$$$SHEETBASE_APPS'] = {
            getApp: () => ({ Database: 'An Database instance' }),
        };

        const result = database();

        expect(result).to.equal('An Database instance');
    });

    it('#database (app has no .Database)', () => {
        const result = database(new AppService({ backendUrl: '' }));

        expect(result instanceof DatabaseService).to.equal(true);
    });

});
