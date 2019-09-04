import { expect } from 'chai';
import { describe, it } from 'mocha';
import { localforageCreateInstanceStub } from './_libs';

import { ApiService } from '../src/lib/api/api.service';
import { FetchService } from '../src/lib/fetch/fetch.service';
import { LocalstorageService } from '../src/lib/localstorage/localstorage.service';
import { CacheService } from '../src/lib/cache/cache.service';
import { DatabaseService } from '../src/lib/database/database.service';
import { AuthService } from '../src/lib/auth/auth.service';
import { MailService } from '../src/lib/mail/mail.service';
import { StorageService } from '../src/lib/storage/storage.service';

import { AppService, AppsService } from '../src/lib/app/app.service';
import { initializeApp, defaultApp, app } from '../src/lib/app/index';

localforageCreateInstanceStub.returns({
  getItem: () => null,
} as any);

describe('(App) AppService', () => {

  it('should be created', () => {
    window['$$$SHEETBASE_COMPONENTS'] = {};

    const sheetbaseApp = new AppService();

    expect(sheetbaseApp.options).eql({});
    // built-in
    expect(sheetbaseApp.Api instanceof ApiService).equal(true, '.Api');
    expect(sheetbaseApp.api() instanceof ApiService).equal(true, '#api');
    expect(sheetbaseApp.Fetch instanceof FetchService).equal(true, '.Fetch');
    expect(sheetbaseApp.fetch() instanceof FetchService).equal(true, '#fetch');
    expect(sheetbaseApp.Localstorage instanceof LocalstorageService).equal(true, '.Localstorage');
    expect(sheetbaseApp.localstorage() instanceof LocalstorageService).equal(true, '#localstorage');
    expect(sheetbaseApp.Cache instanceof CacheService).equal(true, '.Cache');
    expect(sheetbaseApp.cache() instanceof CacheService).equal(true, '#cache');
    // custom
    expect(sheetbaseApp.auth.bind(sheetbaseApp)).throw('No auth component.', '#auth');
    expect(sheetbaseApp.database.bind(sheetbaseApp)).throw('No database component.', '#database');
    expect(sheetbaseApp.storage.bind(sheetbaseApp)).throw('No storage component.', '#storage');
    expect(sheetbaseApp.mail.bind(sheetbaseApp)).throw('No mail component.', '#mail');
  });

  it('should initialize other components', () => {
    window['$$$SHEETBASE_COMPONENTS'] = {
      Auth: AuthService,
      Database: DatabaseService,
      Storage: StorageService,
      Mail: MailService,
    };

    const sheetbaseApp = new AppService();

    expect(sheetbaseApp.Auth instanceof AuthService).equal(true, '.Auth');
    expect(sheetbaseApp.Database instanceof DatabaseService).equal(true, '.Database');
    expect(sheetbaseApp.Storage instanceof StorageService).equal(true, '.Storage');
    expect(sheetbaseApp.Mail instanceof MailService).equal(true, '.Mail');
    expect(sheetbaseApp.auth() instanceof AuthService).equal(true, '#auth');
    expect(sheetbaseApp.database() instanceof DatabaseService).equal(true, '#database');
    expect(sheetbaseApp.storage() instanceof StorageService).equal(true, '#storage');
    expect(sheetbaseApp.mail() instanceof MailService).equal(true, '#mail');
  });

});

describe('(App) AppsService', () => {

  const appsService = new AppsService();

  it('#createApp', () => {
    appsService.createApp({ backendUrl: '' });
    appsService.createApp({ backendUrl: '' }, 'app1');
    appsService.createApp({ backendUrl: '' }, 'app2');
    // @ts-ignore
    expect(Object.keys(appsService.apps)).eql(['DEFAULT', 'app1', 'app2']);
  });

  it('#createApp should throw error, app exists', () => {
    expect(
      appsService.createApp.bind(appsService, { backendUrl: '' }),
    ).throw('An app exists with the name "DEFAULT".');
  });

  it('#getApp', () => {
    const app2 = appsService.getApp('app2');
    expect(!!app2).equal(true);
  });

  it('#getApp should throw error, app not exists', () => {
    expect(
      appsService.getApp.bind(appsService, 'app3'),
    ).throw('No app exists with the name "app3". Please run initializeApp() first.');
  });

});

describe('(App) methods', () => {

  it('#initializeApp', () => {
    const sheetbaseApp = initializeApp();
    expect(sheetbaseApp instanceof AppService).equal(true);
  });

  it('#defaultApp', () => {
    const sheetbaseApp = defaultApp();
    expect(sheetbaseApp instanceof AppService).equal(true);
  });

  it('#app', () => {
    const sheetbaseApp = app('DEFAULT');
    expect(sheetbaseApp instanceof AppService).equal(true);
  });

});
