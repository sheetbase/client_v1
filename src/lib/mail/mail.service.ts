import { MailingData } from '@sheetbase/gmail-server';

import { ApiService } from '../api/api.service';

export class MailService {
    private options: any;
    private Api: ApiService;

    constructor(options: any) {
        this.options = {
            mailEndpoint: 'mail',
            ... options,
        };
        this.Api = new ApiService(options)
            .setEndpoint(this.options.mailEndpoint);
    }

    async quota() {
        return await this.Api.get('/quota', {});
    }

    async send(mailingData: MailingData, transporter = 'gmail') {
        return await this.Api.post('/', {}, { mailingData, transporter });
    }

}