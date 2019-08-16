import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { MailingData } from './types';

export class MailService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.mailEndpoint || 'mail');
    }

    async quota() {
        return await this.Api.get('/', {});
    }

    async send(
        mailingData: MailingData,
        category = 'uncategorized',
        template = null,
        silent = null,
    ) {
        return await this.Api.post('/', {}, { mailingData, category, template, silent });
    }

}