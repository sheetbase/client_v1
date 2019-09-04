import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';

import { DatabaseDirectService } from '../src/lib/database/direct';
import { DatabaseServerService } from '../src/lib/database/server';

import { DatabaseService } from '../src/lib/database/database.service';
import { database } from '../src/lib/database/index';
import {
  buildQuery,
  buildAdvancedFilter,
  buildSegmentFilter,
} from '../src/lib/database/filter';

let databaseService: DatabaseService;

function before() {
  databaseService = new DatabaseService(
    new AppService(),
  );
}

function after() {}

describe('(Database) Database service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseService.app instanceof AppService).equal(true, 'app instance');
    // @ts-ignore
    expect(databaseService.DatabaseDirect instanceof DatabaseDirectService).equal(true, 'direct instance');
    // @ts-ignore
    expect(databaseService.DatabaseServer instanceof DatabaseServerService).equal(true, 'server instance');
    // @ts-ignore
    expect(databaseService.BUILTIN_PUBLIC_GIDS).eql({
      categories: '101',
      tags: '102',
      pages: '103',
      posts: '104',
      authors: '105',
      threads: '106',
      options: '108',
      bundles: '111',
      audios: '112',
      videos: '113',
      products: '114',
      notifications: '181',
      promotions: '182',
    });
    // @ts-ignore
    expect(databaseService.AUTO_LOADED_JSON_SCHEME).equal('json://');
    // @ts-ignore
    expect(databaseService.AUTO_LOADED_TEXT_SCHEME).equal('content://');
    // @ts-ignore
    expect(databaseService.globalSegment).equal(undefined);
  });

  it('instances', () => {
    const direct = databaseService.direct();
    const server = databaseService.server();
    expect(direct instanceof DatabaseDirectService).equal(true, 'direct instance');
    expect(server instanceof DatabaseServerService).equal(true, 'server instance');
  });

  it('#setSegmentation', () => {
    const result = databaseService.setSegmentation({ a: 1 });
    // @ts-ignore
    expect(databaseService.globalSegment).eql({ a: 1 });
    expect(result instanceof DatabaseService).equal(true);
  });

  it('#getMethodOptions (default)', () => {
    const result = databaseService.getMethodOptions({});
    expect(result).eql({
      useCached: true,
      cacheTime: 1440,
      docsStyle: 'full',
      segment: undefined,
      autoLoaded: true,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it('#getMethodOptions (custom)', () => {
    const result = databaseService.getMethodOptions({
      useCached: false,
      cacheTime: 0,
      docsStyle: 'clean',
      segment: { a: 1 },
      autoLoaded: false,
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
    expect(result).eql({
      useCached: false,
      cacheTime: 0,
      docsStyle: 'clean',
      segment: { a: 1 },
      autoLoaded: false,
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
  });

  it('#hasDirectAccess (no database id)', () => {
    // @ts-ignore
    const result = databaseService.hasDirectAccess('categories');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (no direct access)', () => {
    databaseService.app.options.databaseId = 'xxx';
    // @ts-ignore
    const result = databaseService.hasDirectAccess('xxx');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (has direct access)', () => {
    databaseService.app.options.databaseId = 'xxx';
    // @ts-ignore
    const result = databaseService.hasDirectAccess('categories');
    expect(result).equal(true);
  });

  it('#hasDirectAccess (custom gids)', () => {
    databaseService.app.options.databaseId = 'xxx';
    databaseService.app.options.databaseGids = { xxx: '123' };
    // @ts-ignore
    const result = databaseService.hasDirectAccess('xxx');
    expect(result).equal(true);
  });

  it('#isUrl', () => {
    // @ts-ignore
    const result1 = databaseService.isUrl('xxx');
    // @ts-ignore
    const result2 = databaseService.isUrl('http://xxx.xxx');
    // @ts-ignore
    const result3 = databaseService.isUrl('https://xxx.xxx');
    expect(result1).equal(false);
    expect(result2).equal(true);
    expect(result3).equal(true);
  });

  it('#isFileId', () => {
    // @ts-ignore
    const result1 = databaseService.isFileId('xxx');
    // @ts-ignore
    const result2 = databaseService.isFileId('17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W');
    expect(result1).equal(false);
    expect(result2).equal(true);
  });

  it('#isDocId', () => {
    // @ts-ignore
    const result1 = databaseService.isDocId('xxx');
    // @ts-ignore
    const result2 = databaseService.isDocId('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc');
    expect(result1).equal(false);
    expect(result2).equal(true);
  });

  it('#buildAutoLoadedValue (any or doc id)', () => {
    // @ts-ignore
    const result1 = databaseService.buildAutoLoadedValue('xxx', '');
    // @ts-ignore
    const result2 = databaseService.buildAutoLoadedValue('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc', '');
    expect(result1).equal('xxx');
    expect(result2).equal('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc');
  });

  it('#buildAutoLoadedValue (url)', () => {
    // @ts-ignore
    const result = databaseService.buildAutoLoadedValue('json://https://xxx.xxx', 'json://');
    expect(result).equal('https://xxx.xxx');
  });

  it('#buildAutoLoadedValue (fild id)', () => {
    // @ts-ignore
    const result = databaseService.buildAutoLoadedValue(
      'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W', 'content://');
    expect(result).equal(
      'https://drive.google.com/uc?id=17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W');
  });

});

describe('(Database) Filter', () => {

  it('#buildQuery (shorthand)', () => {
    const result = buildQuery({ a: 1 });
    expect(result).eql({ where: 'a', equal: 1 });
  });

  it('#buildQuery', () => {
    const result = buildQuery({ where: 'a', childEqual: 'xxx' });
    expect(result).eql({ where: 'a', childEqual: 'xxx' });
  });

  it('#buildAdvancedFilter (equal)', () => {
    const result = buildAdvancedFilter({ where: 'a', equal: 1 });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 2 })).equal(false, 'not equal');
    expect(result({ a: 1 })).equal(true, 'equal');
  });

  it('#buildAdvancedFilter (exists)', () => {
    const result = buildAdvancedFilter({ where: 'a', exists: true });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: '' })).equal(false, 'empty string');
    expect(result({ a: null })).equal(false, 'null');
    expect(result({ a: undefined })).equal(false, 'undefined');
    expect(result({ a: 1 })).equal(true, 'exists');
  });

  it('#buildAdvancedFilter (not exists)', () => {
    const result = buildAdvancedFilter({ where: 'a', exists: false });
    expect(result({ a: 1 })).equal(false, 'exists');
    expect(result({ a: '' })).equal(true, 'empty string');
    expect(result({ a: null })).equal(true, 'null');
    expect(result({ a: undefined })).equal(true, 'undedined');
    expect(result({})).equal(true, 'not exists');
  });

  it('#buildAdvancedFilter (contains)', () => {
    const result = buildAdvancedFilter({ where: 'a', contains: 'xxx' });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 1 })).equal(false, 'not string');
    expect(result({ a: 'abc xxx def'})).equal(true, 'contains');
  });

  it('#buildAdvancedFilter (lt)', () => {
    const result = buildAdvancedFilter({ where: 'a', lt: 1 });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not number');
    expect(result({ a: 1 })).equal(false, 'equal');
    expect(result({ a: 0 })).equal(true, 'less than');
  });

  it('#buildAdvancedFilter (lte)', () => {
    const result = buildAdvancedFilter({ where: 'a', lte: 1 });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not number');
    expect(result({ a: 1 })).equal(true, 'equal');
    expect(result({ a: 0 })).equal(true, 'less than');
  });

  it('#buildAdvancedFilter (gt)', () => {
    const result = buildAdvancedFilter({ where: 'a', gt: 1 });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not number');
    expect(result({ a: 1 })).equal(false, 'equal');
    expect(result({ a: 2 })).equal(true, 'greater than');
  });

  it('#buildAdvancedFilter (gte)', () => {
    const result = buildAdvancedFilter({ where: 'a', gte: 1 });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not number');
    expect(result({ a: 1 })).equal(true, 'equal');
    expect(result({ a: 2 })).equal(true, 'greater than');
  });

  it('#buildAdvancedFilter (childExists, object)', () => {
    const result = buildAdvancedFilter({ where: 'a', childExists: 'xxx' });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({ a: {} })).equal(false, 'not exists');
    expect(result({ a: { xxx: '' } })).equal(false, 'empty string');
    expect(result({ a: { xxx: null } })).equal(false, 'null');
    expect(result({ a: { xxx: undefined } })).equal(false, 'undefined');
    expect(result({ a: { xxx: 1 } })).equal(true, 'exists');
  });

  it('#buildAdvancedFilter (childExists, array)', () => {
    const result = buildAdvancedFilter({ where: 'a', childExists: 'xxx' });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({ a: [] })).equal(false, 'not exists');
    expect(result({ a: ['xxx'] })).equal(true, 'exists');
  });

  it('#buildAdvancedFilter (not childExists, object)', () => {
    const result = buildAdvancedFilter({ where: 'a', childExists: '!xxx' });
    expect(result({ a: { xxx: 1 } })).equal(false, 'exists');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({})).equal(true, 'no key');
    expect(result({ a: {} })).equal(true, 'not exists');
    expect(result({ a: { xxx: '' } })).equal(true, 'empty string');
    expect(result({ a: { xxx: null } })).equal(true, 'null');
    expect(result({ a: { xxx: undefined } })).equal(true, 'undefined');
  });

  it('#buildAdvancedFilter (not childExists, array)', () => {
    const result = buildAdvancedFilter({ where: 'a', childExists: '!xxx' });
    expect(result({ a: ['xxx'] })).equal(false, 'exists');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({})).equal(true, 'no key');
    expect(result({ a: [] })).equal(true, 'not exists');
  });

  it('#buildAdvancedFilter (childEqual, string)', () => {
    const result = buildAdvancedFilter({ where: 'a', childEqual: 'xxx=def' });
    expect(result({})).equal(false, 'no key');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({ a: {} })).equal(false, 'not exists');
    expect(result({ a: { xxx: '' } })).equal(false, 'empty string');
    expect(result({ a: { xxx: null } })).equal(false, 'null');
    expect(result({ a: { xxx: undefined } })).equal(false, 'undefined');
    expect(result({ a: { xxx: 'abc' } })).equal(false, 'not equal');
    expect(result({ a: { xxx: 'def' } })).equal(true, 'equal');
  });

  it('#buildAdvancedFilter (childEqual, number)', () => {
    const result = buildAdvancedFilter({ where: 'a', childEqual: 'xxx=1' });
    expect(result({ a: { xxx: 1 } })).equal(true, 'equal');
  });

  it('#buildAdvancedFilter (not childEqual)', () => {
    const result = buildAdvancedFilter({ where: 'a', childEqual: 'xxx!=1' });
    expect(result({ a: { xxx: 1 } })).equal(false, 'equal');
    expect(result({ a: 'xxx' })).equal(false, 'not object');
    expect(result({})).equal(true, 'no key');
    expect(result({ a: {} })).equal(true, 'not exists');
    expect(result({ a: { xxx: '' } })).equal(true, 'empty string');
    expect(result({ a: { xxx: null } })).equal(true, 'null');
    expect(result({ a: { xxx: undefined } })).equal(true, 'undefined');
    expect(result({ a: { xxx: 'abc' } })).equal(true, 'not equal');
  });

  it('#buildSegmentFilter (no segment)', () => {
    const result = buildSegmentFilter(null);
    expect(result({})).equal(true);
  });

  it('#buildSegmentFilter (empty segment)', () => {
    const result = buildSegmentFilter({});
    expect(result({})).equal(true);
  });

  it('#buildSegmentFilter (1, matched, no field)', () => {
    const result = buildSegmentFilter({ xxx: 1 });
    expect(result({})).equal(true);
  });

  it('#buildSegmentFilter (1, not matched)', () => {
    const result = buildSegmentFilter({ xxx: 1 });
    expect(result({ xxx: 2 })).equal(false);
  });

  it('#buildSegmentFilter (1, matched)', () => {
    const result = buildSegmentFilter({ xxx: 1 });
    expect(result({ xxx: 1 })).equal(true);
  });

  it('#buildSegmentFilter (>1 & <=3, not matched)', () => {
    const result = buildSegmentFilter({ a: 1, b: 2 });
    expect(result({ a: 1, b: 3 })).equal(false);
  });

  it('#buildSegmentFilter (>1 & <=3, matched)', () => {
    const result = buildSegmentFilter({ a: 1, b: 2, c: 3 });
    expect(result({ a: 1, b: 2, c: 3 })).equal(true);
  });

  it('#buildSegmentFilter (>3, matched, no field)', () => {
    const result = buildSegmentFilter({ a: 1, b: 2, c: 3, d: 4 });
    expect(result({ a: 1, b: 2, c: 3 })).equal(true);
  });

  it('#buildSegmentFilter (>3, not matched)', () => {
    const result = buildSegmentFilter({ a: 1, b: 2, c: 3, d: 4 });
    expect(result({ a: 1, b: 2, c: 3, d: 5 })).equal(false);
  });

  it('#buildSegmentFilter (>3, matched)', () => {
    const result = buildSegmentFilter({ a: 1, b: 2, c: 3, d: 4 });
    expect(result({ a: 1, b: 2, c: 3, d: 4 })).equal(true);
  });

});

describe('(Database) methods', () => {

  it('#database (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;
    expect(
      database.bind(null),
    ).throw('No app for database component.');
  });

  it('#database (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Database: 'An Database instance' }),
    };

    const result = database();

    expect(result).equal('An Database instance');
  });

  it('#database (app has no .Database)', () => {
    const result = database(new AppService({ backendUrl: '' }));

    expect(result instanceof DatabaseService).equal(true);
  });

});
