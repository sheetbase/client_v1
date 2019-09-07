import { AppOptions } from './types';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';
import { LocalstorageService } from '../localstorage/localstorage.service';
import { CacheService } from '../cache/cache.service';
import { FetchService } from '../fetch/fetch.service';

class AppService {

  options: AppOptions;

  Localstorage: LocalstorageService;
  Cache: CacheService;
  Fetch: FetchService;
  Api: ApiService;
  Database: DatabaseService;
  Auth: AuthService;
  Storage: StorageService;
  Mail: MailService;

  constructor(options?: AppOptions) {
    this.options = options || {};
    this.Localstorage = new LocalstorageService(this);
    this.Cache = new CacheService(this);
    this.Fetch = new FetchService(this);
    this.Api = new ApiService(this);
    // initiate other components when available
    for (const key of Object.keys(window['$$$SHEETBASE_COMPONENTS'])) {
      this[key] = new window['$$$SHEETBASE_COMPONENTS'][key](this);
    }
  }

  localstorage() {
    return this.Localstorage;
  }

  cache() {
    return this.Cache;
  }

  fetch() {
    return this.Fetch;
  }

  api() {
    return this.Api;
  }

  database() {
    if (!this.Database) { throw new Error('No database component.'); }
    return this.Database;
  }

  auth() {
    if (!this.Auth) { throw new Error('No auth component.'); }
    return this.Auth;
  }

  storage() {
    if (!this.Storage) { throw new Error('No storage component.'); }
    return this.Storage;
  }

  mail() {
    if (!this.Mail) { throw new Error('No mail component.'); }
    return this.Mail;
  }

}

class AppsService {

  private apps: { [name: string]: AppService } = {};

  constructor() { }

  createApp(options?: AppOptions, name = 'DEFAULT') {
    if (!!this.apps[name]) {
      throw new Error(`An app exists with the name "${name}".`);
    }
    this.apps[name] = new AppService(options);
    return this.apps[name];
  }

  getApp(name = 'DEFAULT') {
    const app = this.apps[name];
    if (!app) {
      throw new Error(`No app exists with the name "${name}". Please run initializeApp() first.`);
    }
    return app;
  }

}

export { AppsService, AppService };
