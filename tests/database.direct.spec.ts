import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { AppService } from '../src/lib/app/app.service';

import { DatabaseDirectService } from '../src/lib/database/direct';

let databaseDirectService: DatabaseDirectService;

// let apiGetStub: sinon.SinonStub;

function before() {
  databaseDirectService = new DatabaseDirectService(
    new AppService(),
    'xxx',
    {},
    null,
  );
}

function after() {
  // apiGetStub.restore();
}

describe('(Database) Database direct service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseDirectService.app instanceof AppService).to.equal(true);
  });

  it('#parseCSV', async () => {
    // @ts-ignore
    const result = await databaseDirectService.parseCSV(
      'a,b,c\n' +
      '1,2,3',
    );
    expect(result).to.eql([
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
    expect(result).to.eql({
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
