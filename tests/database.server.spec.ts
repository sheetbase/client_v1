import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService, MockedApiService } from './_mocks';

import { DatabaseServerService } from '../src/lib/database/server';

let databaseServerService: DatabaseServerService;

let apiGetStub: sinon.SinonStub;
let allStub: sinon.SinonStub;
let queryStub: sinon.SinonStub;
let itemStub: sinon.SinonStub;
let updateStub: sinon.SinonStub;

function before() {
  databaseServerService = new DatabaseServerService(
    new MockedAppService() as any,
  );
  // @ts-ignore
  apiGetStub = sinon.stub(databaseServerService.Api, 'get')
    .callsFake((...args) => ({ method: 'GET', args }) as any);
  allStub = sinon.stub(databaseServerService, 'all');
  queryStub = sinon.stub(databaseServerService, 'query');
  itemStub = sinon.stub(databaseServerService, 'item');
  updateStub = sinon.stub(databaseServerService, 'update')
    .callsFake((...args) => args as any);
}

function after() {
  apiGetStub.restore();
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

    const result = await databaseServerService.all('xxx');
    expect(result).eql({
      method: 'GET',
      args: ['/', { sheet: 'xxx' }],
    });
  });

  it('#query', async () => {
    queryStub.restore();

    const result = await databaseServerService.query(
      'xxx', { where: 'a', equal: 1 },
    );
    expect(result).eql({
      method: 'GET',
      args: [
        '/',
        {
          where: 'a',
          equal: 1,
          sheet: 'xxx',
          segment: null,
        },
      ],
    });
  });

  it('#item', async () => {
    itemStub.restore();

    const result = await databaseServerService.item('xxx', 'xxx-1');
    expect(result).eql({
      method: 'GET',
      args: [
        '/',
        {
          sheet: 'xxx',
          key: 'xxx-1',
        },
      ],
    });
  });

  it('#docsContent', async () => {
    let apiGetArgs;
    apiGetStub.callsFake(async (...args) => {
      apiGetArgs = { method: 'GET', args };
      return { content: '<p>doc id content ...</p>' };
    });

    const result = await databaseServerService.docsContent(
      'doc-id-xxx',
    );
    expect(apiGetArgs).eql({
      method: 'GET',
      args: [
        '/content',
        {
          docId: 'doc-id-xxx',
          style: 'full',
        },
      ],
    });
    expect(result).equal('<p>doc id content ...</p>');
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
