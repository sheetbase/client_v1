import { expect } from 'chai';
import { describe, it } from 'mocha';

import { initializeApp } from '../src/sheetbase';

const app = initializeApp({ backendUrl: 'http://example.com' });

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
