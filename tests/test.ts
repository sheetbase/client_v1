import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import * as localforage from 'localforage';
import { initializeApp, app, api, database, auth, storage, mail } from '../src/sheetbase';

import { AppsService } from '../src/lib/app';
import { ApiService } from '../src/lib/api/api.service';
import { DatabaseService } from '../src/lib/database/database.service';
import { AuthService } from '../src/lib/auth/auth.service';
import { StorageService } from '../src/lib/storage/storage.service';
import { MailService } from '../src/lib/mail/mail.service';
import { decodeJWTPayload } from '../src/lib/utils';

export const localforageStub = sinon.stub(localforage);

global['atob'] = (b64: string) => Buffer.from(b64, 'base64').toString();

describe('#initializeApp', () => {

    const sheetbaseApp = initializeApp({ backendUrl: 'http://example.com' });

    it('should create an app instance', () => {
        expect(!!sheetbaseApp).to.equal(true);
    });

    it('should have members', () => {
        expect(!!sheetbaseApp.Api).to.equal(true);
        expect(!!sheetbaseApp.Database).to.equal(true);
        expect(!!sheetbaseApp.Auth).to.equal(true);
        expect(!!sheetbaseApp.Storage).to.equal(true);
        expect(!!sheetbaseApp.Mail).to.equal(true);
        expect(sheetbaseApp.options instanceof Function).to.equal(true);
        expect(sheetbaseApp.api instanceof Function).to.equal(true);
        expect(sheetbaseApp.database instanceof Function).to.equal(true);
        expect(sheetbaseApp.auth instanceof Function).to.equal(true);
        expect(sheetbaseApp.storage instanceof Function).to.equal(true);
        expect(sheetbaseApp.mail instanceof Function).to.equal(true);
    });

    it('should have correct instances', () => {
        expect(sheetbaseApp.Api instanceof ApiService).to.equal(true);
        expect(sheetbaseApp.Database instanceof DatabaseService).to.equal(true);
        expect(sheetbaseApp.Auth instanceof AuthService).to.equal(true);
        expect(sheetbaseApp.Storage instanceof StorageService).to.equal(true);
        expect(sheetbaseApp.Mail instanceof MailService).to.equal(true);
        expect(sheetbaseApp.api() instanceof ApiService).to.equal(true);
        expect(sheetbaseApp.database() instanceof DatabaseService).to.equal(true);
        expect(sheetbaseApp.auth() instanceof AuthService).to.equal(true);
        expect(sheetbaseApp.storage() instanceof StorageService).to.equal(true);
        expect(sheetbaseApp.mail() instanceof MailService).to.equal(true);
    });

});

describe('#app', () => {

    const sheetbaseApp = app();

    it('should create an app instance', () => {
        expect(!!sheetbaseApp).to.equal(true);
    });

    it('should have members', () => {
        expect(!!sheetbaseApp.Api).to.equal(true);
        expect(!!sheetbaseApp.Database).to.equal(true);
        expect(!!sheetbaseApp.Auth).to.equal(true);
        expect(!!sheetbaseApp.Storage).to.equal(true);
        expect(!!sheetbaseApp.Mail).to.equal(true);
        expect(sheetbaseApp.options instanceof Function).to.equal(true);
        expect(sheetbaseApp.api instanceof Function).to.equal(true);
        expect(sheetbaseApp.database instanceof Function).to.equal(true);
        expect(sheetbaseApp.auth instanceof Function).to.equal(true);
        expect(sheetbaseApp.storage instanceof Function).to.equal(true);
        expect(sheetbaseApp.mail instanceof Function).to.equal(true);
    });

    it('should have correct instances', () => {
        expect(sheetbaseApp.Api instanceof ApiService).to.equal(true);
        expect(sheetbaseApp.Database instanceof DatabaseService).to.equal(true);
        expect(sheetbaseApp.Auth instanceof AuthService).to.equal(true);
        expect(sheetbaseApp.Storage instanceof StorageService).to.equal(true);
        expect(sheetbaseApp.Mail instanceof MailService).to.equal(true);
        expect(sheetbaseApp.api() instanceof ApiService).to.equal(true);
        expect(sheetbaseApp.database() instanceof DatabaseService).to.equal(true);
        expect(sheetbaseApp.auth() instanceof AuthService).to.equal(true);
        expect(sheetbaseApp.storage() instanceof StorageService).to.equal(true);
        expect(sheetbaseApp.mail() instanceof MailService).to.equal(true);
    });

});

describe('Apps service', () => {

    const appsService = new AppsService();

    it('#createApp', () => {
        appsService.createApp({ backendUrl: '/' });
        appsService.createApp({ backendUrl: '/' }, 'app1');
        appsService.createApp({ backendUrl: '/' }, 'app2');
        // @ts-ignore
        expect(Object.keys(appsService.apps)).to.eql(['DEFAULT', 'app1', 'app2']);
    });

    it('#createApp should throw error, app exists', () => {
        expect(
            appsService.createApp.bind(appsService, { backendUrl: '/' }),
        ).to.throw('An app exists with the name "DEFAULT".');
    });

    it('#getApp', () => {
        const app2 = appsService.getApp('app2');
        expect(!!app2).to.equal(true);
    });

    it('#getApp should throw error, app exists', () => {
        expect(
            appsService.getApp.bind(appsService, 'app3'),
        ).to.throw('No app exists with the name "app3". Please run initializeApp() first.');
    });

});

describe('member direct methods', () => {

    it('#api should return the instance', () => {
        expect(api() instanceof ApiService).to.equal(true);
    });

    it('#database should return the instance', () => {
        expect(database() instanceof DatabaseService).to.equal(true);
    });

    it('#auth should return the instance', () => {
        expect(auth() instanceof AuthService).to.equal(true);
    });

    it('#storage should return the instance', () => {
        expect(storage() instanceof StorageService).to.equal(true);
    });

    it('#mail should return the instance', () => {
        expect(mail() instanceof MailService).to.equal(true);
    });

});

describe('utils', () => {

    it('#decodeJWTPayload', () => {
        // tslint:disable-next-line:max-line-length
        const result = decodeJWTPayload('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
        expect(result).to.eql({
            sub: '1234567890',
            name: 'John Doe',
            iat: 1516239022,
        });
    });

});