import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { MailingData, MailSentResult, MailingQuota, MailingThread } from './types';

export class MailService {

  private Api: ApiService;

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
    this.Api = this.app.Api
      .extend()
      .setEndpoint(this.app.options.mailEndpoint || 'mail');
  }

  quota() {
    return this.Api.get<MailingQuota>('/');
  }

  threads(category = 'uncategorized') {
    return this.Api.get<MailingThread[]>('/threads', { category });
  }

  send(
    mailingData: MailingData,
    category = 'uncategorized',
    template = null,
    silent = null,
  ) {
    return this.Api.put<MailSentResult>('/', {}, { mailingData, category, template, silent });
  }

}