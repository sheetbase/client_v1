import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

import { DatabaseDirectService } from '../src/lib/database/direct';

let databaseDirectService: DatabaseDirectService;

// let apiGetStub: sinon.SinonStub;

function before() {
  databaseDirectService = new DatabaseDirectService(
    new MockedAppService() as any, undefined, {}, undefined,
  );
}

function after() {
  // apiGetStub.restore();
}

describe('(Database) Database direct service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseDirectService.app instanceof MockedAppService).equal(true);
    // @ts-ignore
    expect(databaseDirectService.PARSING_URL_SCHEME).equal('url:');
    // @ts-ignore
    expect(databaseDirectService.databaseId).equal(undefined);
    // @ts-ignore
    expect(databaseDirectService.databaseGids).eql({});
    // @ts-ignore
    expect(databaseDirectService.customDataParser).equal(undefined);
  });

  it('#parseCSV', async () => {
    // @ts-ignore
    const result = await databaseDirectService.parseCSV(
      'a,b,c\n' +
      '1,2,3',
    );
    expect(result).eql([
      {
        a: '1',
        b: '2',
        c: '3',
      },
    ]);
  });

  it('#parseItem', () => {
    // @ts-ignore
    const result = databaseDirectService.parseItem({
      // basic
      a0: '',
      a1: null,
      a2: undefined,
      b1: 0,
      b2: 1,
      b3: '2',
      c1: true,
      c2: false,
      c3: 'true',
      c4: 'FALSE',
      d: '{"a":1}',
      // builtin
      e: 'url:xxx',
    });
    expect(result).eql({
      // basic
      // a0: '',
      // a1: null,
      // a2: undefined,
      b1: 0,
      b2: 1,
      b3: 2,
      c1: true,
      c2: false,
      c3: true,
      c4: false,
      d: { a: 1 },
      // builtin
      e: 'https://drive.google.com/uc?id=xxx',
    });
  });

  it('#all', async () => {
    //
  });

});
