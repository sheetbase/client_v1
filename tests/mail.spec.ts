import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MailService } from '../src/lib/mail/mail.service';
import { ApiService } from '../src/lib/api/api.service';

const mailService = new MailService({ backendUrl: '' });

let apiGetStub: sinon.SinonStub;
let apiPostStub: sinon.SinonStub;

function buildStubs() {
    // @ts-ignore
    apiGetStub = sinon.stub(mailService.Api, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(mailService.Api, 'post');
}

function restoreStubs() {
    apiGetStub.restore();
    apiPostStub.restore();
}

describe('(Mail) Mail service', () => {

    beforeEach(() => {
        buildStubs();
        apiGetStub.callsFake(async (endpoint, params) => {
            return { method: 'GET', endpoint, params };
        });
        apiPostStub.callsFake(async (endpoint, params, body) => {
            return { method: 'POST', endpoint, params, body };
        });
    });
    afterEach(() => restoreStubs());

    it('.options should have default values', () => {
        // @ts-ignore
        expect(mailService.options.mailEndpoint).to.equal('mail');
    });

    it('.options should have custom values', () => {
        const mailService = new MailService({
            backendUrl: '',
            mailEndpoint: 'xxx',
        });
        // @ts-ignore
        expect(mailService.options.mailEndpoint).to.equal('xxx');
    });

    it('.Api should be initiated', () => {
        // @ts-ignore
        expect(mailService.Api instanceof ApiService).to.equal(true);
    });

    it('#quota', async () => {
        const result = await mailService.quota();
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/quota',
            params: {},
        });
    });

    it('#send', async () => {
        const result = await mailService.send({
            recipient: 'xxx@xxx.xxx',
        }, 'mail');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/',
            params: {},
            body: {
                mailingData: {
                    recipient: 'xxx@xxx.xxx',
                },
                transporter: 'mail',
            },
        });
    });

});