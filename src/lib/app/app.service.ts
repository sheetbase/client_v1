import { AppOptions } from './types';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';

declare const sheetbase: {
    api?(app: AppService): ApiService;
    auth?(app: AppService): AuthService;
    database?(app: AppService): DatabaseService;
    storage?(app: AppService): StorageService;
    mail?(app: AppService): MailService;
};

class AppService {

    options: AppOptions;

    Api: ApiService;
    Auth: AuthService;
    Database: DatabaseService;
    Storage: StorageService;
    Mail: MailService;

    constructor(options: AppOptions) {
        this.options = options;

        // create instances if available
        if (!!sheetbase.api && sheetbase.api instanceof Function) {
            this.Api = sheetbase.api(this);
        }
        if (!!sheetbase.auth && sheetbase.auth instanceof Function) {
            this.Auth = sheetbase.auth(this);
        }
        if (!!sheetbase.database && sheetbase.database instanceof Function) {
            this.Database = sheetbase.database(this);
        }
        if (!!sheetbase.storage && sheetbase.storage instanceof Function) {
            this.Storage = sheetbase.storage(this);
        }
        if (!!sheetbase.mail && sheetbase.mail instanceof Function) {
            this.Mail = sheetbase.mail(this);
        }
    }

    api() {
        return this.Api;
    }

    auth() {
        return this.Auth;
    }

    database() {
        return this.Database;
    }

    storage() {
        return this.Storage;
    }

    mail() {
        return this.Mail;
    }

}

class AppsService {

    private apps: { [name: string]: AppService } = {};

    constructor() {}

    createApp(options: AppOptions, name = 'DEFAULT') {
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
