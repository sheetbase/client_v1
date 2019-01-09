import { MailingData } from '@sheetbase/gmail-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class MailService {
    private options: Options;
    private apiService: ApiService;

    constructor(options: Options) {
        this.options = {
            mailEndpoint: 'mail',
            ... options,
        };
        this.apiService = new ApiService(options);
    }

    endpoint(paths?: string | string[]) {
        return this.apiService.buildEndpoint(this.options.mailEndpoint, paths);
    }

    async quota() {
        return await this.apiService.get(this.endpoint('quota'), {});
    }

    async send(mailingData: MailingData, transporter = 'gmail') {
        return await this.apiService.post(this.endpoint(), {}, { mailingData, transporter });
    }

}