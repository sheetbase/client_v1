import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

import { DatabaseDirectService } from '../src/lib/database/direct';
import { DatabaseServerService } from '../src/lib/database/server';
import { DataFilterService } from '../src/lib/database/filter';

import { DatabaseService } from '../src/lib/database/database.service';
import { database } from '../src/lib/database/index';

let databaseService: DatabaseService;

let cacheRemoveByPrefixStub: sinon.SinonStub;
let fetchGetStub: sinon.SinonStub;
let allStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let itemsStub: sinon.SinonStub;
let increaseStub: sinon.SinonStub;
let clearCachedAllStub: sinon.SinonStub;
let itemsByTermStub: sinon.SinonStub;

function before() {
  databaseService = new DatabaseService(
    new MockedAppService() as any,
  );
  // stubs
  cacheRemoveByPrefixStub = sinon.stub(databaseService.app.Cache, 'removeByPrefix');
  fetchGetStub = sinon.stub(databaseService.app.Fetch, 'get');
  allStub = sinon.stub(databaseService, 'all');
  queryStub = sinon.stub(databaseService, 'query');
  itemsStub = sinon.stub(databaseService, 'items').callsFake((...args) => args as any);
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
  increaseStub.restore();
  clearCachedAllStub.restore();
  itemsByTermStub.restore();
}

describe('(Database) Database service', () => {

  beforeEach(before);
  afterEach(after);

  it('database options (not provided)', () => {
    const databaseService = new DatabaseService(
      new MockedAppService() as any,
    );
    expect(databaseService.app.options.databaseUseCached).equal(undefined);
    expect(databaseService.app.options.databaseCacheTime).equal(undefined);
    expect(databaseService.app.options.databaseDocsStyle).equal(undefined);
    expect(databaseService.app.options.databaseAutoContent).equal(undefined);
  });

  it('database options (custom)', () => {
    const databaseService = new DatabaseService(
      new MockedAppService({
        databaseUseCached: true,
        databaseCacheTime: 1,
        databaseDocsStyle: 'full',
        databaseAutoContent: true,
      }) as any,
    );
    expect(databaseService.app.options.databaseUseCached).equal(true);
    expect(databaseService.app.options.databaseCacheTime).equal(1);
    expect(databaseService.app.options.databaseDocsStyle).equal('full');
    expect(databaseService.app.options.databaseAutoContent).equal(true);
  });

  it('properties', () => {
    expect(databaseService.app instanceof MockedAppService).equal(true, 'app');
    // @ts-ignore
    expect(databaseService.DatabaseDirect instanceof DatabaseDirectService).equal(true, 'direct');
    // @ts-ignore
    expect(databaseService.DatabaseServer instanceof DatabaseServerService).equal(true, 'server');
    // @ts-ignore
    expect(databaseService.DataFilter instanceof DataFilterService).equal(true, 'filter');
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

  it('#getItemsOptions (app default)', () => {
    const databaseService = new DatabaseService(
      new MockedAppService({
        databaseUseCached: false, // for testing purpose
        databaseCacheTime: 1,
      }) as any,
    );
    // @ts-ignore
    const result = databaseService.getItemsOptions({});
    expect(result).eql({
      useCached: false,
      cacheTime: 1,
      segment: undefined,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it('#getItemsOptions (default)', () => {
    // @ts-ignore
    const result = databaseService.getItemsOptions({});
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

  it('#getItemsOptions (custom)', () => {
    // @ts-ignore
    const result = databaseService.getItemsOptions({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'asc',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
    expect(result).eql({
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'asc',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
  });

  it('#getItemOptions (app default)', () => {
    const databaseService = new DatabaseService(
      new MockedAppService({
        databaseDocsStyle: 'original',
        databaseAutoContent: false,
      }) as any,
    );
    // @ts-ignore
    const result = databaseService.getItemOptions({});
    expect(result).eql({
      docsStyle: 'original',
      autoContent: false,
      //
      useCached: true,
      cacheTime: 1440,
      segment: undefined,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it('#getItemOptions (default)', () => {
    // @ts-ignore
    const result = databaseService.getItemOptions({});
    expect(result).eql({
      docsStyle: 'full',
      autoContent: true,
      //
      useCached: true,
      cacheTime: 1440,
      segment: undefined,
      order: undefined,
      orderBy: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it('#getItemOptions (custom)', () => {
    // @ts-ignore
    const result = databaseService.getItemOptions({
      docsStyle: 'clean',
      autoContent: false,
      //
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'asc',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
    expect(result).eql({
      docsStyle: 'clean',
      autoContent: false,
      //
      useCached: false,
      cacheTime: 0,
      segment: { a: 1 },
      order: 'asc',
      orderBy: '#',
      limit: 10,
      offset: 10,
    });
  });

  it('#all (error for direct accessing)', async () => {
    allStub.restore();

    const cacheGetArgs: any = await databaseService.all('tags');
    // @ts-ignore
    databaseService.DatabaseDirect = {
      hasAccess: () => true,
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
      hasAccess: () => true,
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
    // @ts-ignore
    databaseService.DatabaseDirect = {
      hasAccess: () => false,
    };
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

  it('#query (not useCached, but provide the advanced filter)', async () => {
    queryStub.restore();

    const cacheGetArgs: any = await databaseService.query(
      'xxx', item => item['a'] === 1, { useCached: false },
    );

    let error: Error;
    try {
      await cacheGetArgs[1]();
    } catch (err) {
      error = err;
    }

    expect(error.message).equal('Can only use advanced filter with cached data.');
  });

  it('#query (not useCached)', async () => {
    queryStub.restore();

    let serverQueryArgs;
    // @ts-ignore
    databaseService.DatabaseServer = {
      query: async (...args) => {
        serverQueryArgs = args;
        return [{a: 1}] as any;
      },
    };

    const cacheGetArgs: any = await databaseService.query(
      'xxx', { a: 1 }, { useCached: false },
    );
    const result = await cacheGetArgs[1]();

    expect(cacheGetArgs[0]).equal('database_xxx_query_bb6cb5c68df4652941caf652a366f2d8');
    expect(cacheGetArgs[2]).equal(1440);
    expect(serverQueryArgs).eql([
      'xxx', { a: 1 }, undefined,
    ]);
    expect(result).eql([{a: 1}]);
  });

  it('#query (useCached)', async () => {
    queryStub.restore();

    allStub.returns([{a: 1}, {a: 2}, {a: 3}]);

    const cacheGetArgs: any = await databaseService.query('xxx', { a: 1 });
    const result = await cacheGetArgs[1]();

    expect(cacheGetArgs[0]).equal('database_xxx_query_bb6cb5c68df4652941caf652a366f2d8');
    expect(cacheGetArgs[2]).equal(0);
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

  it('#item (no autoContent, from server, error)', async () => {
    const cacheGetArgs: any = await databaseService.item(
      'xxx', { a: 1 }, { useCached: false, autoContent: false },
    );

    let error: Error;
    try {
      await cacheGetArgs[1]();
    } catch (err) {
      error = err;
    }

    expect(error.message).equal('Can only get item from server with item $key.');
  });

  it('#item (no autoContent, from server)', async () => {
    let serverItemArgs;
    // @ts-ignore
    databaseService.DatabaseServer = {
      item: async (...args) => {
        serverItemArgs = args;
        return {a: 1} as any;
      },
    };

    const cacheGetArgs: any = await databaseService.item(
      'xxx', 'xxx-1', { useCached: false, autoContent: false },
    );
    const result = await cacheGetArgs[1]();
    const cacheKey = cacheGetArgs[3]({
      $key: 'abc', // for testing purpose
    });

    expect(serverItemArgs).eql(['xxx', 'xxx-1']);
    expect(cacheGetArgs[0]).equal(null);
    expect(cacheGetArgs[2]).equal(1440);
    expect(cacheKey).equal('database_xxx_item_abc');
    expect(result).eql({a: 1});
  });

  it('#item (no autoContent, from cached, finder is a string)', async () => {
    let queryArgs;
    queryStub.callsFake((...args) => {
      queryArgs = args;
      return [{a: 1}];
    });

    const cacheGetArgs: any = await databaseService.item(
      'xxx', 'xxx-1', { autoContent: false }, // useCached = true
    );
    const result = await cacheGetArgs[1]();

    expect(queryArgs).eql([
      'xxx', { where: '$key', equal: 'xxx-1' }, { autoContent: false },
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoContent, from cached, finder is a number)', async () => {
    let queryArgs;
    queryStub.callsFake((...args) => {
      queryArgs = args;
      return [{a: 1}];
    });

    const cacheGetArgs: any = await databaseService.item(
      'xxx', 1, { autoContent: false }, // useCached = true
    );
    const result = await cacheGetArgs[1]();

    expect(queryArgs).eql([
      'xxx', { where: '#', equal: 1 }, { autoContent: false },
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoContent, from cached, finder is a query)', async () => {
    let queryArgs;
    queryStub.callsFake((...args) => {
      queryArgs = args;
      return [{a: 1}];
    });

    const cacheGetArgs: any = await databaseService.item(
      'xxx', { a: 1 }, { autoContent: false }, // useCached = true
    );
    const result = await cacheGetArgs[1]();

    expect(queryArgs).eql([
      'xxx', { a: 1 }, { autoContent: false },
    ]);
    expect(result).eql({a: 1});
  });

  it('#item (no autoContent, multiple query items => no item)', async () => {
    queryStub.returns([{a: 1}, {a: 2}]);

    const cacheGetArgs: any = await databaseService.item(
      'xxx', { a: 1 }, { autoContent: false }, // useCached = true
    );
    const result = await cacheGetArgs[1]();

    expect(result).equal(null);
  });

  it('#item (no autoContent)', async () => {
    queryStub.returns([
      {
        a: 1,
        b: 'json://https://xxx.xxx',
        c: 'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
        d: 'content://1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc',
      },
    ]);

    const cacheGetArgs: any = await databaseService.item(
      'xxx', { a: 1 }, { autoContent: false },
    );
    const result = await cacheGetArgs[1]();

    expect(result).eql({
      a: 1,
      b: 'json://https://xxx.xxx',
      c: 'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
      d: 'content://1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc',
    });
  });

  it('#item (has autoContent)', async () => {
    queryStub.returns([
      {
        a: 1,
        b: 'json://https://xxx.xxx',
        c: 'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
        d: 'content://1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc',
      },
    ]);
    // @ts-ignore
    databaseService.DatabaseDirect = {
      fulfillItemContent: async () => ({
        a: 1,
        b: { b1: 1, b2: 2 },
        c: '<p>content ... </p>',
        d: '<p>doc content ... </p>',
      }) as any,
    };

    const cacheGetArgs: any = await databaseService.item('xxx', { a: 1 });
    const result = await cacheGetArgs[1]();

    expect(result).eql({
      a: 1,
      b: { b1: 1, b2: 2 },
      c: '<p>content ... </p>',
      d: '<p>doc content ... </p>',
    });
  });

  it('#docsContent', async () => {
    let docsContentArgs;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      docsContent: async (...args) => {
        docsContentArgs = args;
        return '<p>doc content ...</p>';
      },
    };
    const cacheGetArgs: any = await databaseService.docsContent('doc-id-xxx');
    const result = await cacheGetArgs[1]();

    expect(cacheGetArgs[0]).equal('content_doc-id-xxx_full');
    expect(cacheGetArgs[2]).equal(1440);
    expect(docsContentArgs).eql([
      'doc-id-xxx', 'full',
    ]);
    expect(result).equal('<p>doc content ...</p>');
  });

  it('#textContent', async () => {
    let textContentArgs;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      textContent: async (...args) => {
        textContentArgs = args;
        return '<p>content ...</p>';
      },
    };

    const cacheGetArgs: any = await databaseService.textContent('https://xxx.xxx');
    const result = await cacheGetArgs[1]();

    expect(cacheGetArgs[0]).equal('content_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(1440);
    expect(textContentArgs).eql(['https://xxx.xxx']);
    expect(result).equal('<p>content ...</p>');
  });

  it('#jsonContent', async () => {
    let jsonContentArgs;
    // @ts-ignore
    databaseService.DatabaseDirect = {
      jsonContent: async (...args) => {
        jsonContentArgs = args;
        return { a: 1 } as any;
      },
    };

    const cacheGetArgs: any = await databaseService.jsonContent('https://xxx.xxx');
    const result = await cacheGetArgs[1]();

    expect(cacheGetArgs[0]).equal('content_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(1440);
    expect(jsonContentArgs).eql(['https://xxx.xxx']);
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
    cacheRemoveByPrefixStub.callsFake((...args) => args);

    const result = await databaseService.clearCachedItem('xxx', 'xxx-1');
    expect(result).eql([
      'database_xxx_item_xxx-1',
    ]);
  });

  it('#clearCachedContent (doc id)', async () => {
    cacheRemoveByPrefixStub.callsFake((...args) => args);

    const result = await databaseService.clearCachedContent('doc-id-xxx');
    expect(result).eql(['content_doc-id-xxx']);
  });

  it('#clearCachedContent (url)', async () => {
    cacheRemoveByPrefixStub.callsFake((...args) => args);

    const result = await databaseService.clearCachedContent('https://xxx.xxx');
    expect(result).eql(['content_6b89c305ffa17e4cd1c7d839566ff058']);
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
