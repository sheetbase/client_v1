import { MailingData } from '@sheetbase/gmail-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class MailService {
    private options: Options;
    private Api: ApiService;

    constructor(options: Options) {
        this.options = {
            mailEndpoint: 'mail',
            ... options,
        };
        this.Api = new ApiService(options, {
            endpoint: this.options.mailEndpoint,
        });
    }

    async quota() {
        return await this.Api.get('/quota', {});
    }

    async send(mailingData: MailingData, transporter = 'gmail') {
        return await this.Api.post('/', {}, { mailingData, transporter });
    }

}