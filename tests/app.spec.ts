import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import 'jsdom-global/register';

import { ApiService } from '../src/lib/api/api.service';
import { FetchService } from '../src/lib/fetch/fetch.service';
import { LocalstorageService } from '../src/lib/localstorage/localstorage.service';
import { CacheService } from '../src/lib/cache/cache.service';

import { AppService, AppsService } from '../src/lib/app/app.service';
import { initializeApp, defaultApp, app } from '../src/lib/app/index';

const OPTIONS = { backendUrl: '' };

describe('(App) AppService', () => {

  it('should be created', () => {
    window['$$$SHEETBASE_COMPONENTS'] = {};

    const sheetbaseApp = new AppService(OPTIONS);

    expect(sheetbaseApp.options).to.eql(OPTIONS);
    // built-in
    expect(sheetbaseApp.Api instanceof ApiService).to.equal(true, '.Api');
    expect(sheetbaseApp.api() instanceof ApiService).to.equal(true, '#api');
    expect(sheetbaseApp.Fetch instanceof FetchService).to.equal(true, '.Fetch');
    expect(sheetbaseApp.fetch() instanceof FetchService).to.equal(true, '#fetch');
    expect(sheetbaseApp.Localstorage instanceof LocalstorageService).to.equal(true, '.Localstorage');
    expect(sheetbaseApp.localstorage() instanceof LocalstorageService).to.equal(true, '#localstorage');
    expect(sheetbaseApp.Cache instanceof CacheService).to.equal(true, '.Cache');
    expect(sheetbaseApp.cache() instanceof CacheService).to.equal(true, '#cache');
    // custom
    expect(sheetbaseApp.auth.bind(sheetbaseApp)).to.throw('No auth component.', '#auth');
    expect(sheetbaseApp.database.bind(sheetbaseApp)).to.throw('No database component.', '#database');
    expect(sheetbaseApp.storage.bind(sheetbaseApp)).to.throw('No storage component.', '#storage');
    expect(sheetbaseApp.mail.bind(sheetbaseApp)).to.throw('No mail component.', '#mail');
  });

  it('should initialize other components', () => {
    window['$$$SHEETBASE_COMPONENTS'] = {
      Auth: class Faked {},
      Database: class Faked {},
      Storage: class Faked {},
      Mail: class Faked {},
    };

    const sheetbaseApp = new AppService(OPTIONS);

    expect(!!sheetbaseApp.Auth).to.equal(true, '.Auth');
    expect(!!sheetbaseApp.Database).to.equal(true, '.Database');
    expect(!!sheetbaseApp.Storage).to.equal(true, '.Storage');
    expect(!!sheetbaseApp.Mail).to.equal(true, '.Mail');
    expect(!!sheetbaseApp.auth()).to.equal(true, '#auth');
    expect(!!sheetbaseApp.database()).to.equal(true, '#database');
    expect(!!sheetbaseApp.storage()).to.equal(true, '#storage');
    expect(!!sheetbaseApp.mail()).to.equal(true, '#mail');
  });

});

describe('(App) AppsService', () => {

  const appsService = new AppsService();

  it('#createApp', () => {
    appsService.createApp({ backendUrl: '' });
    appsService.createApp({ backendUrl: '' }, 'app1');
    appsService.createApp({ backendUrl: '' }, 'app2');
    // @ts-ignore
    expect(Object.keys(appsService.apps)).to.eql(['DEFAULT', 'app1', 'app2']);
  });

  it('#createApp should throw error, app exists', () => {
    expect(
      appsService.createApp.bind(appsService, { backendUrl: '' }),
    ).to.throw('An app exists with the name "DEFAULT".');
  });

  it('#getApp', () => {
    const app2 = appsService.getApp('app2');
    expect(!!app2).to.equal(true);
  });

  it('#getApp should throw error, app not exists', () => {
    expect(
      appsService.getApp.bind(appsService, 'app3'),
    ).to.throw('No app exists with the name "app3". Please run initializeApp() first.');
  });

});

describe('(App) methods', () => {

  it('#initializeApp', () => {
    const sheetbaseApp = initializeApp(OPTIONS);
    expect(sheetbaseApp instanceof AppService).to.equal(true);
  });

  it('#defaultApp', () => {
    const sheetbaseApp = defaultApp();
    expect(sheetbaseApp instanceof AppService).to.equal(true);
  });

  it('#app', () => {
    const sheetbaseApp = app('DEFAULT');
    expect(sheetbaseApp instanceof AppService).to.equal(true);
  });

});
