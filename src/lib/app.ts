import { Options } from './types';
import { ApiService } from './api/api.service';
import { DatabaseService } from './database/database.service';
import { AuthService } from './auth/auth.service';
import { StorageService } from './storage/storage.service';
import { MailService } from './mail/mail.service';

export class App {
    private _options: Options;

    Api: ApiService;
    Database: DatabaseService;
    Auth: AuthService;
    Storage: StorageService;
    Mail: MailService;

    constructor(options: Options) {
        this._options = { ... options };
        this.Api = new ApiService(options);
        this.Auth = new AuthService(options);
        this.Database = new DatabaseService(options);
        this.Storage = new StorageService(options);
        this.Mail = new MailService(options);
    }

    options() {
        return this._options;
    }

    api() {
        return this.Api;
    }
    database() {
        return this.Database;
    }
    auth() {
        return this.Auth;
    }
    storage() {
        return this.Storage;
    }
    mail() {
        return this.Mail;
    }

}

export class AppsService {
    private apps: { [name: string]: App } = {};

    constructor() {}

    createApp(options: Options, name = 'DEFAULT') {
        if (!!this.apps[name]) {
            throw new Error(`An app exists with the name "${name}".`);
        }
        this.apps[name] = new App(options);
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