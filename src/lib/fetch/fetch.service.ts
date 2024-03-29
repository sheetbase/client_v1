import { md5 } from '../utils';
import { AppService } from '../app/app.service';

export class FetchService {

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async fetch<Data>(
    input: RequestInfo,
    init?: RequestInit,
    json = true,
  ): Promise<Data> {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw new Error('Fetch failed!');
    }
    return !json ? response.text() : response.json();
  }

  get<Data>(url: string, init?: RequestInit, json = true, cacheTime = 0) {
    return this.app.Cache.get(
      'fetch_' + md5(url),
      () => this.fetch<Data>(url, { ... init, method: 'GET' }, json),
      cacheTime,
    );
  }

  post<Data>(url: string, init?: RequestInit) {
    return this.fetch<Data>(url, { ... init, method: 'POST' });
  }

  put<Data>(url: string, init?: RequestInit) {
    return this.fetch<Data>(url, { ... init, method: 'PUT' });
  }

  patch<Data>(url: string, init?: RequestInit) {
    return this.fetch<Data>(url, { ... init, method: 'PATCH' });
  }

  delete<Data>(url: string, init?: RequestInit) {
    return this.fetch<Data>(url, { ... init, method: 'DELETE' });
  }

}