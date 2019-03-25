import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import * as pubsub from 'pubsub-js';
import * as localforage from 'localforage';

import { localforageStub } from './test';

import { AppService } from '../src/lib/app/app.service';
import { ApiService } from '../src/lib/api/api.service';

import { AuthService } from '../src/lib/auth/auth.service';
import { auth } from '../src/lib/auth/index';
import { User } from '../src/lib/auth/user';

localforageStub.getItem.restore();
localforageStub.setItem.restore();
localforageStub.removeItem.restore();

describe('Auth service', () => {

    const authService = new AuthService(
        new AppService({ backendUrl: '' }),
    );

    let publishStub: sinon.SinonStub;
    let subscribeStub: sinon.SinonStub;
    let getItemStub: sinon.SinonStub;
    let setItemStub: sinon.SinonStub;
    let removeItemStub: sinon.SinonStub;
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
        apiGetStub.restore();
        apiPostStub.restore();
        apiPutStub.restore();
        apiDeleteStub.restore();
        signInStub.restore();
    }

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

    it('properties', () => {
        expect(authService.app instanceof AppService).to.equal(true);
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

    it('#signInAnonymously', async () => {
        let putResult: any;
        apiPutStub.callsFake(async (endpoint, query, body) => {
            putResult = { method: 'PUT', endpoint, query, body };
            return { info: { uid: 'xxx' }, idToken: 'xxx', refreshToken: 'xxx' };
        });
        signInStub.onFirstCall().returns({ uid: 'xxx' });

        const result = await authService.signInAnonymously();
        expect(putResult).to.eql({
            method: 'PUT',
            endpoint: '/',
            query: {},
            body: { offlineAccess: true },
        });
        expect(result.user).to.eql({ uid: 'xxx' });
    });

    // it('#signInWithLocalUser (no local user info)', async () => {
    //     getItemStub.onFirstCall().returns(null);
    //     let result: any;
    //     signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });

    //     // @ts-ignore
    //     await authService.signInWithLocalUser();
    //     expect(result).to.equal(undefined);
    // });

    // it('#signInWithLocalUser (has info but no creds)', async () => {
    //     getItemStub.onFirstCall().returns({ uid: 'xxx' });
    //     getItemStub.onSecondCall().returns(null);
    //     let result: any;
    //     signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });

    //     // @ts-ignore
    //     await authService.signInWithLocalUser();
    //     expect(result).to.equal(undefined);
    // });

    // it('#signInWithLocalUser (has info, has creds, but token expired)', async () => {
    //     getItemStub.onFirstCall().returns({ uid: 'xxx' });
    //     getItemStub.onSecondCall().returns({
    //         // a always expired token
    //         idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    //         refreshToken: 'xxx',
    //     });
    //     let result: any;
    //     signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });
    //     // this for renew id token
    //     apiGetStub.onFirstCall().returns({ idToken: 'renewed id token' });
    //     // this for new info
    //     const apiGetResult = [];
    //     apiGetStub.callsFake(async (endpoint, query) => {
    //         apiGetResult.push({ endpoint, query });
    //         return { uid: 'xxx', newInfo: true };
    //     });

    //     // @ts-ignore
    //     await authService.signInWithLocalUser();
    //     expect(apiGetResult).to.eql([{
    //         endpoint: '/user',
    //         query: { idToken: 'renewed id token' },
    //     }]);
    //     expect(result).to.eql({
    //         info: { uid: 'xxx', newInfo: true },
    //         idToken: 'renewed id token',
    //         refreshToken: 'xxx',
    //     });
    // });

    // it('#signInWithLocalUser (has info, has creds, token not expired)', async () => {
    //     const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    //         Buffer.from(JSON.stringify({
    //             exp: Math.ceil(new Date().getTime() / 1000) + 3600, // expire 1 hour from now
    //         }))
    //         .toString('base64')
    //         .replace(/\+/g, '-')
    //         .replace(/\//g, '_')
    //         .replace(/\=/g, '') +
    //         '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    //     getItemStub.onFirstCall().returns({ uid: 'xxx' });
    //     getItemStub.onSecondCall().returns({
    //         idToken: TOKEN, // a not expired token
    //         refreshToken: 'xxx',
    //     });
    //     let result: any;
    //     signInStub.callsFake((info, idToken, refreshToken) => { result = { info, idToken, refreshToken }; });
    //     // this for new info
    //     const apiGetResult = [];
    //     apiGetStub.callsFake(async (endpoint, query) => {
    //         apiGetResult.push({ endpoint, query });
    //         return { uid: 'xxx', newInfo: true };
    //     });

    //     // @ts-ignore
    //     await authService.signInWithLocalUser();
    //     expect(apiGetResult).to.eql([{
    //         endpoint: '/user',
    //         query: { idToken: TOKEN },
    //     }]);
    //     expect(result).to.eql({
    //         info: { uid: 'xxx', newInfo: true },
    //         idToken: TOKEN,
    //         refreshToken: 'xxx',
    //     });
    // });

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
            body: { oobCode: 'xxx', mode: 'resetPassword', newPassword: '1234567' },
        });
    });

    it('#signIn', async () => {
        signInStub.restore();

        let publishResult: any;
        publishStub.callsFake((event, user) => { publishResult = { event, user }; });
        const setItemResult: any = [];
        setItemStub.callsFake(async (key, value) => { setItemResult.push({ key, value }); });

        // @ts-ignore
        const result = await authService.signIn({ uid: 'xxx' }, 'xxx', 'xxx');
        expect(publishResult.event).to.equal('SHEETBASE_USER_CHANGED');
        expect(publishResult.user instanceof User).to.equal(true, 'publish user');
        expect(setItemResult).to.eql([
            { key: 'SHEETBASE_USER_INFO', value: { uid: 'xxx' } },
            { key: 'SHEETBASE_USER_CREDS', value: { uid: 'xxx', idToken: 'xxx', refreshToken: 'xxx' } },
        ]);
        expect(result instanceof User).to.equal(true, 'final result');
    });

    it('#signOut', async () => {
        let publishResult: any;
        publishStub.callsFake((event, user) => { publishResult = { event, user }; });
        const removeItemResult: any = [];
        removeItemStub.callsFake(async key => { removeItemResult.push(key); });

        await authService.signOut();
        expect(publishResult).to.eql({ event: 'SHEETBASE_USER_CHANGED', user: null });
        expect(removeItemResult).to.eql([
            'SHEETBASE_USER_INFO',
            'SHEETBASE_USER_CREDS',
        ]);
    });

    // it('#signOut (no currentUser)', async () => {
    //     let publishResult: any;
    //     publishStub.callsFake((event, user) => { publishResult = { event, user }; });
    //     const removeItemResult: any = [];
    //     removeItemStub.callsFake(async key => { removeItemResult.push(key); });

    //     authService.currentUser = null;
    //     await authService.signOut();
    //     expect(publishResult).to.equal(undefined);
    //     expect(removeItemResult).to.eql([]);
    // });

});

describe('User', () => {

    const APP = new AppService({ backendUrl: '' });
    const INFO = {
        uid: 'xxx',
        providerId: 'password',
        providerData: null,
        email: 'xxx@xxx.xxx',
        emailVerified: false,
        createdAt: '2019-01-01T00:00:00.1000Z',
        lastLogin: '2019-01-01T00:00:00.1000Z',
        username: '',
        phoneNumber: '',
        displayName: '',
        photoURL: '',
        claims: {},
        isAnonymous: false,
        isNewUser: false,
    };

    const user = new User(APP.Api, INFO as any, 'xxx', 'xxx');

    let apiGetStub: sinon.SinonStub;
    let apiPostStub: sinon.SinonStub;
    let apiPutStub: sinon.SinonStub;
    let apiDeleteStub: sinon.SinonStub;
    let getIdTokenStub: sinon.SinonStub;
    let setInfoStub: sinon.SinonStub;

    function buildStubs() {
        // @ts-ignore
        apiGetStub = sinon.stub(user.Api, 'get');
        // @ts-ignore
        apiPostStub = sinon.stub(user.Api, 'post');
        // @ts-ignore
        apiPutStub = sinon.stub(user.Api, 'put');
        // @ts-ignore
        apiDeleteStub = sinon.stub(user.Api, 'delete');
        getIdTokenStub = sinon.stub(user, 'getIdToken');
        // @ts-ignore
        setInfoStub = sinon.stub(user, 'setInfo');
    }

    function restoreStubs() {
        apiGetStub.restore();
        apiPostStub.restore();
        apiPutStub.restore();
        apiDeleteStub.restore();
        getIdTokenStub.restore();
        setInfoStub.restore();
    }

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

    it('properties', () => {
        // @ts-ignore
        expect(user.Api instanceof ApiService).to.equal(true, '.Api');

        expect(user.idToken).to.equal('xxx', '.idToken');
        expect(user.refreshToken).to.equal('xxx', '.refreshToken');
    });

    it('#setInfo', () => {
        const user = new User(APP.Api, {}, 'xxx', 'xxx');
        setInfoStub.restore();

        // before
        expect(user.uid).to.equal(undefined, '.uid');
        expect(user.providerId).to.equal(undefined, '.providerId');
        expect(user.email).to.equal(undefined, '.email');
        expect(user.emailVerified).to.equal(undefined, '.emailVerified');
        expect(user.createdAt).to.equal(undefined, '.createdAt');
        expect(user.lastLogin).to.equal(undefined, '.lastLogin');
        expect(user.username).to.equal(undefined, '.username');
        expect(user.phoneNumber).to.equal(undefined, '.phoneNumber');
        expect(user.displayName).to.equal(undefined, '.displayName');
        expect(user.photoURL).to.equal(undefined, '.photoURL');
        expect(user.claims).to.equal(undefined, '.claims');
        expect(user.isAnonymous).to.equal(undefined, '.isAnonymous');
        expect(user.isNewUser).to.equal(undefined, '.isNewUser');

        // @ts-ignore
        user.setInfo(INFO as any);

        // after
        expect(user.uid).to.equal('xxx', '.uid');
        expect(user.providerId).to.equal('password', '.providerId');
        expect(user.email).to.equal('xxx@xxx.xxx', '.email');
        expect(user.emailVerified).to.equal(false, '.emailVerified');
        expect(user.createdAt).to.equal('2019-01-01T00:00:00.1000Z', '.createdAt');
        expect(user.lastLogin).to.equal('2019-01-01T00:00:00.1000Z', '.lastLogin');
        expect(user.username).to.equal('', '.username');
        expect(user.phoneNumber).to.equal('', '.phoneNumber');
        expect(user.displayName).to.equal('', '.displayName');
        expect(user.photoURL).to.equal('', '.photoURL');
        expect(user.claims).to.eql({}, '.claims');
        expect(user.isAnonymous).to.equal(false, '.isAnonymous');
        expect(user.isNewUser).to.equal(false, '.isNewUser');
    });

    it('#toJSON', () => {
        const result = user.toJSON();

        expect(result.uid).to.equal('xxx', '.uid');
        expect(result.providerId).to.equal('password', '.providerId');
        expect(result.email).to.equal('xxx@xxx.xxx', '.email');
        expect(result.emailVerified).to.equal(false, '.emailVerified');
        expect(result.createdAt).to.equal('2019-01-01T00:00:00.1000Z', '.createdAt');
        expect(result.lastLogin).to.equal('2019-01-01T00:00:00.1000Z', '.lastLogin');
        expect(result.username).to.equal('', '.username');
        expect(result.phoneNumber).to.equal('', '.phoneNumber');
        expect(result.displayName).to.equal('', '.displayName');
        expect(result.photoURL).to.equal('', '.photoURL');
        expect(result.claims).to.eql({}, '.claims');
        expect(result.isAnonymous).to.equal(false, '.isAnonymous');
        expect(result.isNewUser).to.equal(false, '.isNewUser');
    });

    it('#getIdToken (not expired)', async () => {
        getIdTokenStub.restore();

        const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
            Buffer.from(JSON.stringify({
                exp: Math.ceil(new Date().getTime() / 1000) + 3600, // expire 1 hour from now
            }))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/\=/g, '') +
            '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        user.idToken = TOKEN;
        const result = await user.getIdToken();
        expect(result).to.equal(TOKEN);
    });

    it('#getIdToken (forceRefresh)', async () => {
        getIdTokenStub.restore();

        const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
            Buffer.from(JSON.stringify({
                exp: Math.ceil(new Date().getTime() / 1000) + 3600, // expire 1 hour from now
            }))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/\=/g, '') +
            '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

        let apiGetData: any;
        apiGetStub.callsFake(async (endpoint, query) => {
            apiGetData = { endpoint, query };
            return { idToken: 'xxx' };
        });

        user.idToken = TOKEN;
        const result = await user.getIdToken(true);
        expect(apiGetData).to.eql({
            endpoint: '/token',
            query: {
                refreshToken: 'xxx',
            },
        });
        expect(result).to.equal('xxx');
    });

    it('#getIdToken (expired)', async () => {
        getIdTokenStub.restore();

        const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U';

        let apiGetData: any;
        apiGetStub.callsFake(async (endpoint, query) => {
            apiGetData = { endpoint, query };
            return { idToken: 'xxx' };
        });

        user.idToken = TOKEN;
        const result = await user.getIdToken();
        expect(apiGetData).to.eql({
            endpoint: '/token',
            query: {
                refreshToken: 'xxx',
            },
        });
        expect(result).to.equal('xxx');
    });

    it('#getIdTokenResult', async () => {
        // tslint:disable-next-line:max-line-length
        getIdTokenStub.onFirstCall().returns('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ4eHgifQ.KPWrIumSzwFLUIEeIPoyDJ50A1AYcjFBoqnDPtB1blA');

        const result = await user.getIdTokenResult();
        expect(result).eql({
            uid: 'xxx',
        });
    });

    it('#getIdTokenResult (forceRefresh)', async () => {
        let forceRefresh: boolean;
        getIdTokenStub.callsFake(async (force) => {
            forceRefresh = force;
            // tslint:disable-next-line:max-line-length
            return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ4eHgifQ.KPWrIumSzwFLUIEeIPoyDJ50A1AYcjFBoqnDPtB1blA';
        });

        const result = await user.getIdTokenResult(true);
        expect(forceRefresh).to.equal(true);
        expect(result).eql({
            uid: 'xxx',
        });
    });

    it('#sendEmailVerification', async () => {
        const result = await user.sendEmailVerification();
        expect(result).to.eql({
            method: 'PUT',
            endpoint: '/oob',
            query: {},
            body: {
                mode: 'verifyEmail',
                email: 'xxx@xxx.xxx',
            },
        });
    });

    it('#updateProfile', async () => {
        setInfoStub.callsFake(info => info); // forward api response

        const result = await user.updateProfile({
            displayName: 'xxx',
            photoURL: 'xxx',
        });
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/user',
            query: {},
            body: {
                profile: {
                    displayName: 'xxx',
                    photoURL: 'xxx',
                },
            },
        });
    });

    it('#setUsername', async () => {
        setInfoStub.callsFake(info => info); // forward api response

        const result = await user.setUsername('xxx');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/user/username',
            query: {},
            body: {
                username: 'xxx',
            },
        });
    });

    it('#changePassword', async () => {
        const result = await user.changePassword('1234567', '1234567xxx');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/user/password',
            query: {},
            body: {
                currentPassword: '1234567',
                newPassword: '1234567xxx',
            },
        });
    });

    it('#logout', async () => {
        const result = await user.logout();
        expect(result).to.eql({
            method: 'DELETE',
            endpoint: '/',
            query: undefined,
            body: undefined,
        });
    });

    it('#delete', async () => {
        const result = await user.delete();
        expect(result).to.eql({
            method: 'DELETE',
            endpoint: '/cancel',
            query: {},
            body: {
                refreshToken: 'xxx',
            },
        });
    });

});

describe('(Auth) methods', () => {

    it('#auth (no app, no default app)', () => {
        window['$$$SHEETBASE_APPS'] = null;
        expect(
            auth.bind(null),
        ).to.throw('No app for auth component.');
    });

    it('#auth (no app, default app)', () => {
        window['$$$SHEETBASE_APPS'] = {
            getApp: () => ({ Auth: 'An Auth instance' }),
        };

        const result = auth();

        expect(result).to.equal('An Auth instance');
    });

    it('#auth (app has no .Auth)', () => {
        const result = auth(new AppService({ backendUrl: '' }));

        expect(result instanceof AuthService).to.equal(true);
    });

});
