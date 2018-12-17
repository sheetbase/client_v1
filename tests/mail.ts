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
    apiGetStub = sinon.stub(mailService.apiService, 'get');
    // @ts-ignore
    apiPostStub = sinon.stub(mailService.apiService, 'post');
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

    it('.apiService should be initiated', () => {
        // @ts-ignore
        expect(mailService.apiService instanceof ApiService).to.equal(true);
    });

    it('#endpoint should work', () => {
        const result = mailService.endpoint();
        expect(result).to.equal('/mail');
    });

    it('#quota should work', async () => {
        const result = await mailService.quota();
        expect(result).to.eql({
            method: 'GET',
            endpoint: '/mail/quota',
            params: {},
        });
    });

    it('#send should work', async () => {
        const result = await mailService.send({
            recipient: 'xxx@xxx.xxx',
        }, 'mail');
        expect(result).to.eql({
            method: 'POST',
            endpoint: '/mail',
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