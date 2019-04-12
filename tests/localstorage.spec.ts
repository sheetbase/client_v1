import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import * as localforage from 'localforage';

import { AppService } from '../src/lib/app/app.service';

import { LocalstorageService } from '../src/lib/localstorage/localstorage.service';
import { localstorage } from '../src/lib/localstorage/index';

let localstorageService: LocalstorageService;

let createInstanceStub: sinon.SinonStub;

function buildStubs() {
  createInstanceStub = sinon.stub(localforage, 'createInstance');
}

function restoreStubs() {
  createInstanceStub.restore();
}

describe('(Localstorage) Localstorage service', () => {

  beforeEach(() => {
    localstorageService = new LocalstorageService(
      new AppService({ backendUrl: '' }),
    );
    buildStubs();
  });

  afterEach(() => restoreStubs());

});

describe('(Localstorage) methods', () => {

  it('#localstorage (no app, no default app)', () => {
    window['$$$SHEETBASE_APPS'] = null;

    expect(
      localstorage.bind(null),
    ).to.throw('No app for localstorage component.');
  });

  it('#localstorage (no app, default app)', () => {
    window['$$$SHEETBASE_APPS'] = {
      getApp: () => ({ Localstorage: 'An Localstorage instance' }),
    };

    const result = localstorage();

    expect(result).to.equal('An Localstorage instance');
  });

  it('#localstorage (app has no .Localstorage)', () => {
    const result = localstorage({ options: {} } as any);

    expect(result instanceof LocalstorageService).to.equal(true);
  });

});