import { expect } from 'chai';
import { describe, it } from 'mocha';

import { initializeApp } from '../src/sheetbase';
import { App } from '../src/lib/core/app';

const app: App = initializeApp({ backendUrl: 'http://example.com' });

describe('Test', () => {

    it('should create an app instance', () => {
        expect(!!app).to.equal(true);
    });

    it('should have members', () => {
        expect(!!app.Api).to.equal(true);
        expect(app.api instanceof Function).to.equal(true);
        expect(app.options instanceof Function).to.equal(true);
    });

});

describe('API', () => {

    it('#get should work', async () => {
        const result = await app.Api.get();
        expect(result).to.eql({});
    });

});