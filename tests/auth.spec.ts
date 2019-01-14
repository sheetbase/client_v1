import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import * as pubsub from 'pubsub-js';
import * as localforage from 'localforage';
import * as cookie from 'js-cookie';

import { AuthService } from '../src/lib/auth/auth.service';
import { ApiService } from '../src/lib/api/api.service';
import { User } from '../src/lib/auth/user';
import { localforageStub } from './test';

const authService = new AuthService({ backendUrl: '' });

localforageStub.getItem.restore();
localforageStub.setItem.restore();
localforageStub.removeItem.restore();

let publishStub: sinon.SinonStub;
let subscribeStub: sinon.SinonStub;
let getItemStub: sinon.SinonStub;
let setItemStub: sinon.SinonStub;
let removeItemStub: sinon.SinonStub;
let getCookieStub: sinon.SinonStub;
let setCookieStub: sinon.SinonStub;
let removeCookieStub: sinon.SinonStub;
let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;
let apiPutStub: sinon.SinonStub;
let apiDeleteStub: sinon.SinonStub;
let signInStub: sinon.SinonStub;

function buildStubs() {
    publishStub = sinon.stub(pubsub, 'publish');
    subscribeStub = sinon.stub(pubsub, 'subscribe');
    getItemStub = sinon.stub(localforage, 'getItem');
    setItemStub = sinon.stub(localforage, 'setItem');
    removeItemStub = sinon.stub(localforage, 'removeItem');
    getCookieStub = sinon.stub(cookie, 'getJSON');
    setCookieStub = sinon.stub(cookie, 'set');
    removeCookieStub = sinon.stub(cookie, 'remove');
    // @ts-ignore
    apiGetStub = sinon.stub(authService.Api, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(authService.Api, 'post');
    // @ts-ignore
    apiPutStub = sinon.stub(authService.Api, 'put');
    // @ts-ignore
    apiDeleteStub = sinon.stub(authService.Api, 'delete');
    // @ts-ignore
    signInStub = sinon.stub(authService, 'signIn');
}

function restoreStubs() {
    publishStub.restore();
    subscribeStub.restore();
    getItemStub.restore();
    setItemStub.restore();
    removeItemStub.restore();
    getCookieStub.restore();
    setCookieStub.restore();
    removeCookieStub.restore();
    apiGetStub.restore();
    apiPostStub.restore();
    apiPutStub.restore();
    apiDeleteStub.restore();
    signInStub.restore();
}

describe('Auth service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, query) => {
            return { method: 'GET', endpoint, query };
        });
        apiPostStub.callsFake(async (endpoint, query, body) => {
            return { method: 'POST', endpoint, query, body };
        });
        apiPutStub.callsFake(async (endpoint, query, body) => {
            return { method: 'PUT', endpoint, query, body };
        });
        apiDeleteStub.callsFake(async (endpoint, query, body) => {
            return { method: 'DELETE', endpoint, query, body };
        });
    });

    afterEach(() => restoreStubs());

    it('.options should have default values', () => {
        // @ts-ignore
        expect(authService.options.authEndpoint).to.equal('auth');
    });

    it('.options should have custom values', () => {
        const authService = new AuthService({
            backendUrl: '',
            authEndpoint: 'xxx',
        });
        // @ts-ignore
        expect(authService.options.authEndpoint).to.equal('xxx');
    });

    it('.Api should be initiated', () => {
        // @ts-ignore
        expect(authService.Api instanceof ApiService).to.equal(true);
    });

    it('#onAuthStateChanged (no user)', () => {
        subscribeStub.callsFake((e, f) => f('event msg', null));

        let user: any;
        authService.onAuthStateChanged(_user => { user = _user; });
        expect(user).to.equal(null);
    });

    it('#onAuthStateChanged', () => {
        subscribeStub.callsFake((e, f) => f('event msg', {}));

        let user: any;
        authService.onAuthStateChanged(_user => { user = _user; });
        expect(user).to.eql({});
    });

    it('#checkActionCode', async () => {
        const result = await authService.checkActionCode('xxx');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/oob',
            query: { oobCode: 'xxx' },
        });
    });

    it('#createUserWithEmailAndPassword', async () => {
        let putResult: any;
        apiPutStub.callsFake(async (endpoint, query, body) => {
            putResult = { method: 'PUT', endpoint, query, body };
            return { info: { uid: 'xxx' }, idToken: 'xxx', refreshToken: 'xxx' };
        });
        signInStub.onFirstCall().returns({ uid: 'xxx' });

        const result = await authService.createUserWithEmailAndPassword('xxx@xxx.xxx', 'xxx');
        expect(putResult).to.eql({
            method: 'PUT',
            endpoint: '/',
            query: {},
            body: { email: 'xxx@xxx.xxx', password: 'xxx', offlineAccess: true },
        });
        expect(result.user).to.eql({ uid: 'xxx' });
    });

    it('#signInWithEmailAndPassword', async () => {
        let postResult: any;
        apiPostStub.callsFake(async (endpoint, query, body) => {
            postResult = { method: 'POST', endpoint, query, body };
            return { info: { uid: 'xxx' }, idToken: 'xxx', refreshToken: 'xxx' };
        });
        signInStub.onFirstCall().returns({ uid: 'xxx' });

        const result = await authService.signInWithEmailAndPassword('xxx@xxx.xxx', 'xxx');
        expect(postResult).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { email: 'xxx@xxx.xxx', password: 'xxx', offlineAccess: true },
        });
        expect(result.user).to.eql({ uid: 'xxx' });
    });

    it('#signInWithCustomToken', async () => {
        let postResult: any;
        apiPostStub.callsFake(async (endpoint, query, body) => {
            postResult = { method: 'POST', endpoint, query, body };
            return { info: { uid: 'xxx' }, idToken: 'xxx', refreshToken: 'xxx' };
        });
        signInStub.onFirstCall().returns({ uid: 'xxx' });

        const result = await authService.signInWithCustomToken('xxx');
        expect(postResult).to.eql({
            method: 'POST',
            endpoint: '/',
            query: {},
            body: { customToken: 'xxx', offlineAccess: true },
        });
        expect(result.user).to.eql({ uid: 'xxx' });
    });

    it('#sendPasswordResetEmail', async () => {
        const result = await authService.sendPasswordResetEmail('xxx@xxx.xxx');
        expect(result).to.eql({
            method: 'PUT',
            endpoint: '/oob',
            query: {},
            body: { email: 'xxx@xxx.xxx', mode: 'resetPassword' },
        });
    });

    it('#verifyPasswordResetCode', async () => {
        const result = await authService.verifyPasswordResetCode('xxx');
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/oob',
            query: { oobCode: 'xxx', mode: 'resetPassword' },
        });
    });

    it('#confirmPasswordReset', async () => {
        const result = await authService.confirmPasswordReset('xxx', '1234567');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/oob',
            query: {},
            body: { oobCode: 'xxx', mode: 'resetPassword', password: '1234567' },
        });
    });

    it('#signInLocal (no local user)', async () => {
        getItemStub.onFirstCall().returns(null);
        let result: any;
        signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });

        await authService.signInLocal();
        expect(result).to.equal(undefined);
    });

    it.skip('#signInLocal', async () => {
        getItemStub.onFirstCall().returns({ uid: 'xxx' });
        getCookieStub.onFirstCall().returns({ idToken: 'xxx', refreshToken: 'xxx' });
        let result: any;
        signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });

        await authService.signInLocal();
        expect(result).to.equal(undefined);
    });

    it('#signIn', async () => {
        signInStub.restore();

        let publishResult: any;
        publishStub.callsFake((event, user) => { publishResult = { event, user }; });
        let setItemResult: any;
        setItemStub.callsFake((key, value) => { setItemResult = { key, value }; });
        let setCookieResult: any;
        setCookieStub.callsFake((key, value) => { setCookieResult = { key, value }; });

        // @ts-ignore
        const result = await authService.signIn({ uid: 'xxx' }, 'xxx', 'xxx');
        expect(publishResult.event).to.equal('AUTH_USER');
        expect(publishResult.user instanceof User).to.equal(true, 'publish user');
        expect(setItemResult).to.eql({ key: 'AUTH_USER', value: { uid: 'xxx' } });
        expect(setCookieResult).to.eql({ key: 'AUTH_CREDS', value: { idToken: 'xxx', refreshToken: 'xxx' } });
        expect(result instanceof User).to.equal(true, 'final result');
    });

    it('#signOut', async () => {
        let publishResult: any;
        publishStub.callsFake((event, user) => { publishResult = { event, user }; });
        let removeItemResult: any;
        removeItemStub.callsFake(key => { removeItemResult = key; });
        let removeCookieResult: any;
        removeCookieStub.callsFake(key => { removeCookieResult = key; });

        await authService.signOut();
        expect(publishResult).to.eql({ event: 'AUTH_USER', user: null });
        expect(removeItemResult).to.equal('AUTH_USER');
        expect(removeCookieResult).to.equal('AUTH_CREDS');
    });

});

describe('User', () => {

    beforeEach(() => {
        buildStubs();
    });

    afterEach(() => restoreStubs());

});