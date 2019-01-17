import { MailingData } from '@sheetbase/gmail-server';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

export class MailService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'mail');
    }

    async quota() {
        return await this.Api.get('/quota', {});
    }

    async send(mailingData: MailingData, transporter = 'gmail') {
        return await this.Api.post('/', {}, { mailingData, transporter });
    }

}