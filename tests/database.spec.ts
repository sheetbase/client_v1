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
let databaseAllStub: sinon.SinonStub;
let databaseQueryStub: sinon.SinonStub;
let databaseUpdateStub: sinon.SinonStub;

function buildStubs() {
    // @ts-ignore
    apiGetStub = sinon.stub(databaseService.Api, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(databaseService.Api, 'post');
    databaseAllStub = sinon.stub(databaseService, 'all');
    databaseQueryStub = sinon.stub(databaseService, 'query');
    databaseUpdateStub = sinon.stub(databaseService, 'update');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
    databaseAllStub.restore();
    databaseQueryStub.restore();
    databaseUpdateStub.restore();
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
    });
    afterEach(() => restoreStubs());

    it('properties', () => {
        expect(databaseService.app instanceof AppService).to.equal(true);
        // @ts-ignore
        expect(databaseService.Api instanceof ApiService).to.equal(true);
    });

    it('#all', async () => {
        databaseAllStub.restore();

        const result = await databaseService.all('foo');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: { sheet: 'foo' },
        });
    });

    it('#query (no offline, simple query)', async () => {
        databaseQueryStub.restore();

        const result = await databaseService.query('foo', { where: 'a', equal: 1 }, false);
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: {
                sheet: 'foo',
                where: 'a',
                equal: 1,
            },
        });
    });

    it('#query (no offline, simple query shorthand)', async () => {
        databaseQueryStub.restore();

        const result = await databaseService.query('foo', { a: 1 }, false);
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/',
            query: {
                sheet: 'foo',
                where: 'a',
                equal: 1,
            },
        });
    });

    it('#query (no offline, advanced query => throw error)', async () => {
        databaseQueryStub.restore();

        let error: Error;
        try {
            const result = await databaseService.query('foo', (item: any) => true, false);
        } catch (err) {
            error = err;
        }
        expect(error.message).to.equal('Can only apply advanced query when offline argument is true.');
    });

    it('#query (offline, simple query)', async () => {
        databaseAllStub.returns([
            { a: 1, b: 2 },
            { a: 2, b: 2 },
            { a: 1, b: 3 },
        ]);

        databaseQueryStub.restore();

        const result = await databaseService.query('foo', { where: 'a', equal: 1 });
        expect(result).to.eql([
            { a: 1, b: 2 },
            { a: 1, b: 3 },
        ]);
    });

    it('#query (offline, simple query shorthand)', async () => {
        databaseAllStub.returns([
            { a: 1, b: 2 },
            { a: 2, b: 2 },
            { a: 1, b: 3 },
        ]);

        databaseQueryStub.restore();

        const result = await databaseService.query('foo', { a: 1 });
        expect(result).to.eql([
            { a: 1, b: 2 },
            { a: 1, b: 3 },
        ]);
    });

    it('#query (offline, advanced query)', async () => {
        databaseAllStub.returns([
            { a: 1, b: 2 },
            { a: 2, b: 2 },
            { a: 1, b: 3 },
        ]);

        databaseQueryStub.restore();

        const result = await databaseService.query('foo', (item: any) => (item.a === 1));
        expect(result).to.eql([
            { a: 1, b: 2 },
            { a: 1, b: 3 },
        ]);
    });

    it('#item (pass correct values to #query, finder = string)', async () => {
        let queryArgs: any;
        databaseQueryStub.callsFake(async (sheet, finder, offline, cacheTime) => {
            queryArgs = { sheet, finder, offline, cacheTime };
        });

        const result = await databaseService.item('foo', 'foo-1', false, 60);
        expect(queryArgs).to.eql({
            sheet: 'foo',
            finder: { $key: 'foo-1' },
            offline: false,
            cacheTime: 60,
        });
    });

    it('#item (pass correct values to #query, finder = simple query shorthand)', async () => {
        let queryArgs: any;
        databaseQueryStub.callsFake(async (sheet, finder, offline, cacheTime) => {
            queryArgs = { sheet, finder, offline, cacheTime };
        });

        const result = await databaseService.item('foo', { a: 1 });
        expect(queryArgs).to.eql({
            sheet: 'foo',
            finder: { a: 1 },
            offline: true,
            cacheTime: 0,
        });
    });

    it('#item (query return 0 items)', async () => {
        databaseQueryStub.returns([]);

        const result = await databaseService.item('foo', 'foo-1');
        expect(result).to.equal(null);
    });

    it('#item (query return more than 1 item)', async () => {
        databaseQueryStub.returns([ {a: 1}, {a: 2} ]);

        const result = await databaseService.item('foo', 'foo-1');
        expect(result).to.equal(null);
    });

    it('#item (query return only 1 item)', async () => {
        databaseQueryStub.returns([ {a: 1} ]);

        const result = await databaseService.item('foo', 'foo-1');
        expect(result).to.eql({a: 1});
    });

    it('#update', async () => {
        databaseUpdateStub.restore();

        const result = await databaseService.update('foo', 'foo-1', { a: 1 });
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { sheet: 'foo', key: 'foo-1', data: { a: 1 } },
        });
    });

    it('#add', async () => {
        databaseUpdateStub.callsFake(async (sheet, key, data) => {
            return { sheet, key, data };
        });

        const result = await databaseService.add('foo', null, { a: 1 });
        expect(result).to.eql({
            sheet: 'foo',
            key: null,
            data: { a: 1 },
        });
    });

    it('#remove', async () => {
        databaseUpdateStub.callsFake(async (sheet, key, data) => {
            return { sheet, key, data };
        });

        const result = await databaseService.remove('foo', 'foo-1');
        expect(result).to.eql({
            sheet: 'foo',
            key: 'foo-1',
            data: null,
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
