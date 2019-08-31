import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';
import { ApiService } from '../src/lib/api/api.service';

import { DatabaseService } from '../src/lib/database/database.service';
import { DatabaseDirectService } from '../src/lib/database/direct';
import { DatabaseServerService } from '../src/lib/database/server';
import { database } from '../src/lib/database/index';

let databaseServerService: DatabaseServerService;
let databaseDirectService: DatabaseDirectService;

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;
let databaseAllStub: sinon.SinonStub;
let databaseQueryStub: sinon.SinonStub;
let databaseUpdateStub: sinon.SinonStub;

function before() {
  /**
   * server
   */
  databaseServerService = new DatabaseServerService(
    new AppService({ backendUrl: '' }),
  );
  // @ts-ignore
  apiGetStub = sinon.stub(databaseServerService.Api, 'get');
  // @ts-ignore
  apiPostStub = sinon.stub(databaseServerService.Api, 'post');
  databaseAllStub = sinon.stub(databaseServerService, 'all');
  databaseQueryStub = sinon.stub(databaseServerService, 'query');
  databaseUpdateStub = sinon.stub(databaseServerService, 'update');
  // stubs
  apiGetStub.callsFake(async (endpoint, query) => {
    return { method: 'GET', endpoint, query };
  });
  apiPostStub.callsFake(async (endpoint, query, body) => {
    return { method: 'POST', endpoint, query, body };
  });
  /**
   * client
   */
  databaseDirectService = new DatabaseDirectService(
    new AppService({ backendUrl: '' }),
    'xxx',
    {},
    null,
  );
}

function after() {
  apiGetStub.restore();
  apiPostStub.restore();
  databaseAllStub.restore();
  databaseQueryStub.restore();
  databaseUpdateStub.restore();
}

describe('(Database) Database server service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseServerService.app instanceof AppService).to.equal(true);
    // @ts-ignore
    expect(databaseServerService.Api instanceof ApiService).to.equal(true);
  });

});

describe('(Database) Database direct service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseDirectService.app instanceof AppService).to.equal(true);
  });

  // it('#parseCSV', async () => {
  //   // @ts-ignore
  //   const result = await databaseDirectService.parseCSV(
  //     'a,b,c\n' +
  //     '1,2,3\n' +
  //     '1,2,3',
  //   );
  //   expect(result).to.eql([]);
  // });

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
