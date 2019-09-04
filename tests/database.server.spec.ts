import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService, MockedApiService } from './_mocks';

import { DatabaseServerService } from '../src/lib/database/server';

let databaseServerService: DatabaseServerService;
let allStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let itemStub: sinon.SinonStub;
let updateStub: sinon.SinonStub;

function before() {
  databaseServerService = new DatabaseServerService(
    new MockedAppService() as any,
  );
  allStub = sinon.stub(databaseServerService, 'all');
  queryStub = sinon.stub(databaseServerService, 'query');
  itemStub = sinon.stub(databaseServerService, 'item');
  updateStub = sinon.stub(databaseServerService, 'update')
  .callsFake((...args) => args as any);
}

function after() {
  allStub.restore();
  queryStub.restore();
  itemStub.restore();
  updateStub.restore();
}

describe('(Database) Database server service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseServerService.app instanceof MockedAppService).equal(true, 'app instance');
    // @ts-ignore
    expect(databaseServerService.Api instanceof MockedApiService).equal(true, 'api instance');
    // @ts-ignore
    expect(databaseServerService.Api.baseEndpoint).equal('database');
  });

  it('#all', async () => {
    allStub.restore();

    const result: any = await databaseServerService.all('xxx');
    const apiGetResult = await result[1]();

    expect(result[0]).equal('database_xxx');
    expect(result[2]).equal(0);
    expect(apiGetResult).eql({
      method: 'GET',
      args: [ '/', { sheet: 'xxx' }, -1 ],
    });
  });

  it('#query', async () => {
    queryStub.restore();

    const result: any = await databaseServerService.query(
      'xxx',
      { where: 'a', equal: 1 },
    );
    const apiGetResult = await result[1]();

    expect(result[0]).equal('database_xxx_query_4a2f98478a5d638a3e2687b449058ea9');
    expect(result[2]).equal(0);
    expect(apiGetResult).eql({
      method: 'GET',
      args: [
        '/',
        {
          where: 'a',
          equal: 1,
          sheet: 'xxx',
          segment: null,
        },
        -1,
      ],
    });
  });

  it('#item', async () => {
    itemStub.restore();

    const result: any = await databaseServerService.item('xxx', 'xxx-1');
    const apiGetResult = await result[1]();

    expect(result[0]).equal('database_xxx_item_xxx-1');
    expect(result[2]).equal(0);
    expect(apiGetResult).eql({
      method: 'GET',
      args: [
        '/',
        {
          sheet: 'xxx',
          key: 'xxx-1',
        },
        -1,
      ],
    });
  });

  it('#docsContent', async () => {
    const cacheGetStub = sinon.stub(databaseServerService.app.Cache, 'get');
    let cacheRefreshArgs;
    cacheGetStub.callsFake((...args) => {
      cacheRefreshArgs = args;
      return { content: 'xxx' } as any;
    });

    const result: any = await databaseServerService.docsContent(
      'xxx-1', 'doc-id-xxx',
    );
    const apiGetResult = await cacheRefreshArgs[1]();

    expect(result).equal('xxx');
    expect(cacheRefreshArgs[0]).equal('content_xxx-1_doc-id-xxx_full');
    expect(cacheRefreshArgs[2]).equal(0);
    expect(apiGetResult).eql({
      method: 'GET',
      args: [
        '/content',
        {
          docId: 'doc-id-xxx',
          style: 'full',
        },
        -1,
      ],
    });

    cacheGetStub.restore();
  });

  it('#set', async () => {
    const result: any = await databaseServerService.set(
      'xxx', 'xxx-1', { a: 1 },
    );
    expect(result).eql({
      method: 'POST',
      args: [
        '/',
        {},
        {
          sheet: 'xxx',
          key: 'xxx-1',
          data: { a: 1 },
          clean: true,
        },
      ],
    });
  });

  it('#update', async () => {
    updateStub.restore();

    const result: any = await databaseServerService.update(
      'xxx', 'xxx-1', { a: 1 },
    );
    expect(result).eql({
      method: 'POST',
      args: [
        '/',
        {},
        {
          sheet: 'xxx',
          key: 'xxx-1',
          data: { a: 1 },
        },
      ],
    });
  });

  it('#add', async () => {
    const result: any = await databaseServerService.add(
      'xxx', null, { a: 1 },
    );
    expect(result).eql([
      'xxx', null, { a: 1 },
    ]);
  });

  it('#remove', async () => {
    const result: any = await databaseServerService.remove('xxx', 'xxx-1');
    expect(result).eql([
      'xxx', 'xxx-1', null,
    ]);
  });

  it('#increase', async () => {
    const result: any = await databaseServerService.increase(
      'xxx', 'xxx-1', 'likeCount',
    );
    expect(result).eql({
      method: 'POST',
      args: [
        '/',
        {},
        {
          sheet: 'xxx',
          key: 'xxx-1',
          increasing: 'likeCount',
        },
      ],
    });
  });

});
