import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import 'jsdom-global/register';

import { ApiService } from '../src/lib/api/api.service';
import { AuthService } from '../src/lib/auth/auth.service';
import { DatabaseService } from '../src/lib/database/database.service';
import { StorageService } from '../src/lib/storage/storage.service';
import { MailService } from '../src/lib/mail/mail.service';

import { AppService, AppsService } from '../src/lib/app/app.service';
import { initializeApp, defaultApp, app } from '../src/lib/app/index';

const OPTIONS = { backendUrl: '' };

describe('(App) AppService', () => {

    it('should be created', () => {
        const sheetbaseApp = new AppService(OPTIONS);
        expect(sheetbaseApp.options).to.eql(OPTIONS);
        expect(sheetbaseApp.Api instanceof ApiService).to.equal(true, '.Api');
        expect(sheetbaseApp.api() instanceof ApiService).to.equal(true, '#api');
        expect(sheetbaseApp.auth.bind(sheetbaseApp)).to.throw('No auth component.');
        expect(sheetbaseApp.database.bind(sheetbaseApp)).to.throw('No database component.');
        expect(sheetbaseApp.storage.bind(sheetbaseApp)).to.throw('No storage component.');
        expect(sheetbaseApp.mail.bind(sheetbaseApp)).to.throw('No mail component.');
    });

    it('should initialize other components', () => {
        window['$$$SHEETBASE_COMPONENTS'] = {
            Auth: AuthService,
            Database: DatabaseService,
            Storage: StorageService,
            Mail: MailService,
        };

        const sheetbaseApp = new AppService(OPTIONS);
        expect(sheetbaseApp.Auth instanceof AuthService).to.equal(true, '.Auth');
        expect(sheetbaseApp.Database instanceof DatabaseService).to.equal(true, '.Database');
        expect(sheetbaseApp.Storage instanceof StorageService).to.equal(true, '.Storage');
        expect(sheetbaseApp.Mail instanceof MailService).to.equal(true, '.Mail');
        expect(sheetbaseApp.auth() instanceof AuthService).to.equal(true, '#auth');
        expect(sheetbaseApp.database() instanceof DatabaseService).to.equal(true, '#database');
        expect(sheetbaseApp.storage() instanceof StorageService).to.equal(true, '#storage');
        expect(sheetbaseApp.mail() instanceof MailService).to.equal(true, '#mail');
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
