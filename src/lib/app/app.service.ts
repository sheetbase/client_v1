import { AppOptions } from './types';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';

class AppService {

    options: AppOptions;

    Api: ApiService;
    Auth: AuthService;
    Database: DatabaseService;
    Storage: StorageService;
    Mail: MailService;

    constructor(options: AppOptions) {
        this.options = options;

        // try initiate members when available
        const sheetbase = window['sheetbase'];
        if (!!sheetbase) {
            this.Api = !!sheetbase.api ? sheetbase.api(this) : null;
            this.Auth = !!sheetbase.auth ? sheetbase.auth(this) : null;
            this.Database = !!sheetbase.database ? sheetbase.database(this) : null;
            this.Storage = !!sheetbase.storage ? sheetbase.storage(this) : null;
            this.Mail = !!sheetbase.mail ? sheetbase.mail(this) : null;
        }
    }

    api() {
        if (!this.Api) { throw new Error('No api component.'); }
        return this.Api;
    }

    auth() {
        if (!this.Auth) { throw new Error('No auth component.'); }
        return this.Auth;
    }

    database() {
        if (!this.Database) { throw new Error('No database component.'); }
        return this.Database;
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
