import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

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

let cacheRemoveByPrefixStub: sinon.SinonStub;
let fetchGetStub: sinon.SinonStub;
let allStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let itemsStub: sinon.SinonStub;
let docsContentStub: sinon.SinonStub;
let textContentStub: sinon.SinonStub;
let jsonContentStub: sinon.SinonStub;
let increaseStub: sinon.SinonStub;
let clearCachedAllStub: sinon.SinonStub;
let itemsByTermStub: sinon.SinonStub;

function before() {
  databaseService = new DatabaseService(
    new MockedAppService({
      databaseId: '1Abc',
      databaseGids: { xxx: '123' },
    }) as any,
  );
  // stubs
  cacheRemoveByPrefixStub = sinon.stub(databaseService.app.Cache, 'removeByPrefix');
  fetchGetStub = sinon.stub(databaseService.app.Fetch, 'get');
  allStub = sinon.stub(databaseService, 'all');
  queryStub = sinon.stub(databaseService, 'query');
  itemsStub = sinon.stub(databaseService, 'items').callsFake((...args) => args as any);
  docsContentStub = sinon.stub(databaseService, 'docsContent');
  textContentStub = sinon.stub(databaseService, 'textContent');
  jsonContentStub = sinon.stub(databaseService, 'jsonContent');
  increaseStub = sinon.stub(databaseService, 'increase').callsFake((...args) => args as any);
  clearCachedAllStub = sinon.stub(databaseService, 'clearCachedAll');
  itemsByTermStub = sinon.stub(databaseService, 'itemsByTerm').callsFake((...args) => args as any);
}

function after() {
  cacheRemoveByPrefixStub.restore();
  fetchGetStub.restore();
  allStub.restore();
  queryStub.restore();
  itemsStub.restore();
  docsContentStub.restore();
  textContentStub.restore();
  jsonContentStub.restore();
  increaseStub.restore();
  clearCachedAllStub.restore();
  itemsByTermStub.restore();
}

describe('(Database) Database service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseService.app instanceof MockedAppService).equal(true, 'app instance');
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

  it('#registerDataParser', () => {
    let parser;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      registerDataParser: ps => parser = ps,
    } as any;
    const result = databaseService.registerDataParser(value => value);
    expect(result instanceof DatabaseService).equal(true);
    // @ts-ignore
    expect(parser('xxx')).equal('xxx');
  });

  it('#buildItemsOptions (default)', () => {
    // @ts-ignore
    const result = databaseService.buildItemsOptions({});
    expect(result).eql({
      useCached: true,
      cacheTime: 1440,
      segment: undefined,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it('#buildItemsOptions (custom)', () => {
    // @ts-ignore
    const result = databaseService.buildItemsOptions({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
    expect(result).eql({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
  });

  it('#buildItemOptions (default)', () => {
    // @ts-ignore
    const result = databaseService.buildItemOptions({});
    expect(result).eql({
      useCached: true,
      cacheTime: 1440,
      segment: undefined,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
      docsStyle: 'full',
      autoLoaded: true,
    });
  });

  it('#buildItemOptions (custom)', () => {
    // @ts-ignore
    const result = databaseService.buildItemOptions({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
      docsStyle: 'clean',
      autoLoaded: false,
    });
    expect(result).eql({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'ASC',
      orderBy: '#',
      limit: 10,
      offset: 10,
      docsStyle: 'clean',
      autoLoaded: false,
    });
  });

  it('#hasDirectAccess (no database id)', () => {
    databaseService.app.options.databaseId = null;
    // @ts-ignore
    const result = databaseService.hasDirectAccess('categories');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (no direct access)', () => {
    // @ts-ignore
    const result = databaseService.hasDirectAccess('xxx2');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (has direct access)', () => {
    // @ts-ignore
    const result = databaseService.hasDirectAccess('categories');
    expect(result).equal(true);
  });

  it('#hasDirectAccess (custom gids)', () => {
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

  it('#buildAutoLoadedValue (file id)', () => {
    // @ts-ignore
    const result = databaseService.buildAutoLoadedValue(
      'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W', 'content://');
    expect(result).equal(
      'https://drive.google.com/uc?id=17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W');
  });

  it('#all (error for direct accessing)', async () => {
    allStub.restore();

    const cacheGetArgs: any = await databaseService.all('tags');
    // @ts-ignore
    databaseService.DatabaseDirect = {
      all: async (...args) => {
        throw new Error('...'); // simulate error
      },
    };
    let error: Error;
    try {
      await cacheGetArgs[1]();
    } catch (err) {
      error = err;
    }
    expect(error.message).equal('Unable to access \'tags\' directly, it may not be published.');
    expect(cacheGetArgs[0]).equal('database_tags');
    expect(cacheGetArgs[2]).equal(1440);
  });

  it('#all (direct)', async () => {
    allStub.restore();

    const cacheGetArgs: any = await databaseService.all('tags');
    let directAllArgs;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      all: async (...args) => {
        directAllArgs = args;
        return [1, 2, 3] as any;
      },
    };
    const result = await cacheGetArgs[1]();
    expect(directAllArgs).eql(['tags']);
    expect(result).eql([1, 2, 3]);
  });

  it('#all (server)', async () => {
    allStub.restore();

    const cacheGetArgs: any = await databaseService.all('xxx2');
    let serverAllArgs;
    // @ts-ignore
    databaseService.DatabaseServer = {
      all: async (...args) => {
        serverAllArgs = args;
        return [1, 2, 3] as any;
      },
    };
    const result = await cacheGetArgs[1]();
    expect(serverAllArgs).eql(['xxx2']);
    expect(result).eql([1, 2, 3]);
  });

  it('#query (useCached)', async () => {
    queryStub.restore();

    allStub.returns([{a: 1}, {a: 2}, {a: 3}]);

    const result = await databaseService.query('xxx', { a: 1 });
    expect(result).eql([{a: 1}]);
  });

  it('#query (not useCached, but provide the advanced filter)', async () => {
    queryStub.restore();

    let error: Error;
    try {
      await databaseService.query('xxx', item => item['a'] === 1, { useCached: false });
    } catch (err) {
      error = err;
    }

    expect(error.message).equal('Can only apply advanced query with cached data.');
  });

  it('#query (not useCached)', async () => {
    queryStub.restore();

    const cacheGetArgs: any = await databaseService.query('xxx', { a: 1 }, { useCached: false });
    let serverQueryArgs;
    // @ts-ignore
    databaseService.DatabaseServer = {
      query: async (...args) => {
        serverQueryArgs = args;
        return [{a: 1}] as any;
      },
    };
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('database_xxx_query_4a2f98478a5d638a3e2687b449058ea9');
    expect(cacheGetArgs[2]).equal(1440);
    expect(serverQueryArgs).eql([
      'xxx', { where: 'a', equal: 1 }, undefined,
    ]);
    expect(result).eql([{a: 1}]);
  });

  it('#items (no filter)', async () => {
    itemsStub.restore();

    let allArgs;
    allStub.callsFake((...args) => {
      allArgs = args;
      return [1, 2, 3];
    });

    const result = await databaseService.items('xxx');
    expect(allArgs).eql([
      'xxx', 1440,
    ]);
    expect(result).eql([1, 2, 3]);
  });

  it('#items (filter)', async () => {
    itemsStub.restore();

    let queryArgs;
    queryStub.callsFake((...args) => {
      queryArgs = args;
      return [1, 2, 3];
    });

    const result = await databaseService.items('xxx', { a: 1 });
    expect(queryArgs).eql([
      'xxx', { a: 1 }, {},
    ]);
    expect(result).eql([1, 2, 3]);
  });

  it('#item (no autoLoad, from server)', async () => {
    let serverItemArgs;
    // @ts-ignore
    databaseService.DatabaseServer = {
      item: async (...args) => {
        serverItemArgs = args;
        return {a: 1} as any;
      },
    };

    const cacheGetArgs: any = await databaseService.item(
      'xxx', 'xxx-1', { useCached: false, autoLoaded: false },
    );
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('database_xxx_item_xxx-1');
    expect(cacheGetArgs[2]).equal(1440);
    expect(serverItemArgs).eql([
      'xxx', 'xxx-1',
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoLoad, direct 1)', async () => {
    let directQueryArgs;
    queryStub.callsFake((...args) => {
      directQueryArgs = args;
      return [{a: 1}];
    });

    const result = await databaseService.item(
      'xxx', 'xxx-1', { autoLoaded: false }, // useCached = true
    );
    expect(directQueryArgs).eql([
      'xxx', { $key: 'xxx-1' }, { autoLoaded: false },
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoLoad, direct 2)', async () => {
    let directQueryArgs;
    queryStub.callsFake((...args) => {
      directQueryArgs = args;
      return [{a: 1}];
    });

    const result = await databaseService.item(
      'xxx', { a: 1 }, { autoLoaded: false }, // useCached = true
    );
    expect(directQueryArgs).eql([
      'xxx', { a: 1 }, { autoLoaded: false },
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoLoad, multiple query items => no item)', async () => {
    let directQueryArgs;
    queryStub.callsFake((...args) => {
      directQueryArgs = args;
      return [{a: 1}, {a: 2}];
    });

    const result = await databaseService.item(
      'xxx', { a: 1 }, { autoLoaded: false }, // useCached = true
    );
    expect(directQueryArgs).eql([
      'xxx', { a: 1 }, { autoLoaded: false },
    ]);
    expect(result).equal(undefined);
  });

  it('#item', async () => {
    queryStub.returns([
      {
        a: 1,
        b: 'json://https://xxx.xxx',
        c: 'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
        d: 'content://1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc',
      },
    ]);
    docsContentStub.returns('<p>doc content ... </p>');
    textContentStub.returns('<p>content ... </p>');
    jsonContentStub.returns({ b1: 1, b2: 2 });

    const result = await databaseService.item('xxx', 'xxx-1');
    expect(result).eql({
      a: 1,
      b: { b1: 1, b2: 2 },
      c: '<p>content ... </p>',
      d: '<p>doc content ... </p>',
    });
  });

  it('#docsContent', async () => {
    docsContentStub.restore();

    let docsContentArgs;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      docsContent: async (...args) => {
        docsContentArgs = args;
        return '<p>doc content ...</p>';
      },
    };
    const cacheGetArgs: any = await databaseService.docsContent('xxx-1', 'doc-id-xxx');
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('content_xxx-1_doc-id-xxx_full');
    expect(cacheGetArgs[2]).equal(1440);
    expect(docsContentArgs).eql([
      'doc-id-xxx', 'full',
    ]);
    expect(result).equal('<p>doc content ...</p>');
  });

  it('#textContent', async () => {
    textContentStub.restore();

    let fetchGetArgs;
    fetchGetStub.callsFake(async (...args) => {
      fetchGetArgs = args;
      return '<p>content ...</p>';
    });

    const cacheGetArgs: any = await databaseService.textContent('xxx-1', 'https://xxx.xxx');
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('content_xxx-1_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(1440);
    expect(fetchGetArgs).eql([
      'https://xxx.xxx', {}, false,
    ]);
    expect(result).equal('<p>content ...</p>');
  });

  it('#jsonContent', async () => {
    jsonContentStub.restore();

    let fetchGetArgs;
    fetchGetStub.callsFake(async (...args) => {
      fetchGetArgs = args;
      return { a: 1 } as any;
    });

    const cacheGetArgs: any = await databaseService.jsonContent('xxx-1', 'https://xxx.xxx');
    const result = await cacheGetArgs[1]();
    expect(cacheGetArgs[0]).equal('content_xxx-1_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(1440);
    expect(fetchGetArgs).eql([
      'https://xxx.xxx',
    ]);
    expect(result).eql({ a: 1 });
  });

  it('#set', async () => {
    // @ts-ignore
    databaseService.DatabaseServer = {
      set: async (...args) => args,
    };

    const result = await databaseService.set('xxx', 'xxx-1', { a: 1 });
    expect(result).eql([
      'xxx', 'xxx-1', { a: 1 },
    ]);
  });

  it('#update', async () => {
    // @ts-ignore
    databaseService.DatabaseServer = {
      update: async (...args) => args,
    };

    const result = await databaseService.update('xxx', 'xxx-1', { a: 1 });
    expect(result).eql([
      'xxx', 'xxx-1', { a: 1 },
    ]);
  });

  it('#add', async () => {
    // @ts-ignore
    databaseService.DatabaseServer = {
      add: async (...args) => args,
    };

    const result = await databaseService.add('xxx', null, { a: 1 });
    expect(result).eql([
      'xxx', null, { a: 1 },
    ]);
  });

  it('#remove', async () => {
    // @ts-ignore
    databaseService.DatabaseServer = {
      remove: async (...args) => args,
    };

    const result = await databaseService.remove('xxx', 'xxx-1');
    expect(result).eql([
      'xxx', 'xxx-1',
    ]);
  });

  it('#increase', async () => {
    increaseStub.restore();

    // @ts-ignore
    databaseService.DatabaseServer = {
      increase: async (...args) => args,
    };

    const result = await databaseService.increase('xxx', 'xxx-1', 'likeCount');
    expect(result).eql([
      'xxx', 'xxx-1', 'likeCount',
    ]);
  });

  it('#clearCachedAll (single)', async () => {
    clearCachedAllStub.restore();

    const result = [];
    cacheRemoveByPrefixStub.callsFake((...args) => result.push(args));

    await databaseService.clearCachedAll('xxx');
    expect(result).eql([
      ['database_xxx'],
    ]);
  });

  it('#clearCachedAll (multiple)', async () => {
    clearCachedAllStub.restore();

    const result = [];
    cacheRemoveByPrefixStub.callsFake((...args) => result.push(args));

    await databaseService.clearCachedAll(['xxx', 'xxx2']);
    expect(result).eql([
      ['database_xxx'],
      ['database_xxx2'],
    ]);
  });

  it('#clearCachedItem', async () => {
    const result = [];
    cacheRemoveByPrefixStub.callsFake((...args) => result.push(args));
    let clearCachedAllArgs;
    clearCachedAllStub.callsFake((...args) => clearCachedAllArgs = args);

    await databaseService.clearCachedItem('xxx', 'xxx-1');
    expect(clearCachedAllArgs).eql([
      'xxx',
    ]);
    expect(result).eql([
      ['content_xxx-1'],
    ]);
  });

});

describe('(Database) Database service (convinient methods)', () => {

  beforeEach(before);
  afterEach(after);

  it('#itemsOriginal', async () => {
    const result: any = await databaseService.itemsOriginal('xxx');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(true, 'no origin');
    expect(result[1]({ $key: 'xxx', origin: 'xxx' })).equal(true, 'correct');
    expect(result[1]({ $key: 'xxx', origin: 'xxx2' })).equal(false);
  });

  it('#itemsDraft', async () => {
    const result: any = await databaseService.itemsDraft('xxx');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(true, 'no status');
    expect(result[1]({ status: 'draft' })).equal(true, 'correct');
    expect(result[1]({ status: 'any' })).equal(false);
  });

  it('#itemsPublished', async () => {
    const result: any = await databaseService.itemsPublished('xxx');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no status');
    expect(result[1]({ status: 'any' })).equal(false, 'not correct');
    expect(result[1]({ status: 'published' })).equal(true);
  });

  it('#itemsArchived', async () => {
    const result: any = await databaseService.itemsArchived('xxx');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no status');
    expect(result[1]({ status: 'any' })).equal(false, 'not correct');
    expect(result[1]({ status: 'archived' })).equal(true);
  });

  it('#itemsByRelated (no categories & no tags)', async () => {
    let itemsArgs;
    itemsStub.callsFake((...args) => {
      itemsArgs = args;
      return [{a: 1}, {a: 2}, {a: 3}];
    });
    const result = await databaseService.itemsByRelated('xxx', {});
    expect(itemsArgs).eql([ 'xxx', null, {} ]);
    expect(result).eql([{a: 1}, {a: 2}, {a: 3}]);
  });

  it('#itemsByRelated (ignore current item)', async () => {
    itemsStub.returns([{a: 1}, {$key: 'abc', a: 2}, {a: 3}]);
    const result = await databaseService.itemsByRelated('xxx', { $key: 'abc' });
    expect(result).eql([{a: 1}, {a: 3}]);
  });

  it('#itemsByRelated (match category)', async () => {
    itemsStub.returns([
      {a: 1},
      {a: 2, categories: { abc: true }},
      {a: 3},
    ]);
    const result = await databaseService.itemsByRelated(
      'xxx', { categories: { abc: true } },
    );
    expect(result).eql([
      {a: 2, categories: { abc: true }},
      {a: 1},
      {a: 3},
    ]);
  });

  it('#itemsByRelated (match tag)', async () => {
    itemsStub.returns([
      {a: 1},
      {a: 2, tags: { abc: true }},
      {a: 3},
    ]);
    const result = await databaseService.itemsByRelated(
      'xxx', { tags: { abc: true } },
    );
    expect(result).eql([
      {a: 2, tags: { abc: true }},
      {a: 1},
      {a: 3},
    ]);
  });

  it('#itemsByType', async () => {
    const result: any = await databaseService.itemsByType('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no type');
    expect(result[1]({ type: 'any' })).equal(false, 'not correct');
    expect(result[1]({ type: 'abc' })).equal(true);
  });

  it('#itemsByTypeDefault', async () => {
    const result: any = await databaseService.itemsByTypeDefault('xxx');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({ type: 'any' })).equal(false, 'has type');
    expect(result[1]({})).equal(true);
  });

  it('#itemsByAuthor', async () => {
    const result: any = await databaseService.itemsByAuthor('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no authors');
    expect(result[1]({ authors: {} })).equal(false, 'not correct');
    expect(result[1]({ authors: { abc: true } })).equal(true);
  });

  it('#itemsByLocale', async () => {
    const result: any = await databaseService.itemsByLocale('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no locale');
    expect(result[1]({ locale: 'any' })).equal(false, 'not correct');
    expect(result[1]({ locale: 'abc' })).equal(true);
  });

  it('#itemsByOrigin', async () => {
    const result: any = await databaseService.itemsByOrigin('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no origin');
    expect(result[1]({ origin: 'any' })).equal(false, 'not correct');
    expect(result[1]({ origin: 'abc' })).equal(true);
  });

  it('#itemsByParent', async () => {
    const result: any = await databaseService.itemsByParent('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no parents');
    expect(result[1]({ parents: {} })).equal(false, 'not correct');
    expect(result[1]({ parents: { abc: true } })).equal(true);
  });

  it('#itemsByTerm', async () => {
    itemsByTermStub.restore();

    const result: any = await databaseService.itemsByTerm('xxx', 'tax', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no tax');
    expect(result[1]({ tax: {} })).equal(false, 'not correct');
    expect(result[1]({ tax: { abc: true } })).equal(true);
  });

  it('#itemsByCategory', async () => {
    const result: any = await databaseService.itemsByCategory('xxx', 'abc');
    expect(result).eql([
      'xxx', 'categories', 'abc', {},
    ]);
  });

  it('#itemsByTag', async () => {
    const result: any = await databaseService.itemsByTag('xxx', 'abc');
    expect(result).eql([
      'xxx', 'tags', 'abc', {},
    ]);
  });

  it('#itemsByKeyword', async () => {
    const result: any = await databaseService.itemsByKeyword('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no keywords');
    expect(result[1]({ keywords: 'any' })).equal(false, 'not correct');
    expect(result[1]({ keywords: 'any abc' })).equal(true);
  });

  it('#itemsByMetaExists', async () => {
    const result: any = await databaseService.itemsByMetaExists('xxx', 'abc');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no meta');
    expect(result[1]({ meta: {} })).equal(false, 'not correct');
    expect(result[1]({ meta: { abc: true } })).equal(true);
  });

  it('#itemsByMetaEquals', async () => {
    const result: any = await databaseService.itemsByMetaEquals('xxx', 'abc', '123');
    expect(result[0]).equal('xxx');
    expect(result[2]).eql({});
    //
    expect(result[1]({})).equal(false, 'no meta');
    expect(result[1]({ meta: {} })).equal(false, 'not correct');
    expect(result[1]({ meta: { abc: '456' } })).equal(false, 'not equal');
    expect(result[1]({ meta: { abc: '123' } })).equal(true);
  });

  it('#viewing', async () => {
    const result: any = await databaseService.viewing('xxx', 'abc');
    expect(result).eql([
      'xxx', 'abc', 'viewCount',
    ]);
  });

  it('#liking', async () => {
    const result: any = await databaseService.liking('xxx', 'abc');
    expect(result).eql([
      'xxx', 'abc', 'likeCount',
    ]);
  });

  it('#commenting', async () => {
    const result: any = await databaseService.commenting('xxx', 'abc');
    expect(result).eql([
      'xxx', 'abc', 'commentCount',
    ]);
  });

  it('#rating', async () => {
    const result: any = await databaseService.rating('xxx', 'abc', 3);
    expect(result).eql([
      'xxx', 'abc', {
        'rating/count': 1,
        'rating/total': 3,
      },
    ]);
  });

  it('#sharing (no providers)', async () => {
    const result: any = await databaseService.sharing('xxx', 'abc');
    expect(result).eql([
      'xxx', 'abc', {
        'sharing/total': 1,
      },
    ]);
  });

  it('#sharing (has providers)', async () => {
    const result: any = await databaseService.sharing('xxx', 'abc', ['google']);
    expect(result).eql([
      'xxx', 'abc', {
        'sharing/google': 1,
        'sharing/total': 1,
      },
    ]);
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
    const result = database(new MockedAppService() as any);

    expect(result instanceof DatabaseService).equal(true);
  });

});
