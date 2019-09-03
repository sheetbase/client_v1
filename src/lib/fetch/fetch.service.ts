import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';

import { FetchMeta } from './types';

export class FetchService {

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  fetch<Data>(input: RequestInfo, init?: RequestInit, meta: FetchMeta = {}) {
    const { json = true, cacheTime = 0, cacheKey } = meta;
    // get data
    return this.app.Cache.getRefresh(
      'fetch_' + (!!cacheKey ? cacheKey : md5(input as string)),
      async () => {
        const response = await fetch(input, init);
        if (!response.ok) {
          throw new Error('API fetch failed.');
        }
        // get result
        let result: string | Data;
        if (json) {
          result = await response.json();
        } else {
          result = await response.text();
        }
        return result;
      },
      cacheTime,
    );
  }

  get<Data>(url: string, init?: RequestInit, meta: FetchMeta = {}) {
    return this.fetch<Data>(url, { ... init, method: 'GET' }, meta);
  }

  post<Data>(url: string, init?: RequestInit, meta: FetchMeta = {}) {
    return this.fetch<Data>(url, { ... init, method: 'POST' }, meta);
  }

  put<Data>(url: string, init?: RequestInit, meta: FetchMeta = {}) {
    return this.fetch<Data>(url, { ... init, method: 'PUT' }, meta);
  }

  patch<Data>(url: string, init?: RequestInit, meta: FetchMeta = {}) {
    return this.fetch<Data>(url, { ... init, method: 'PATCH' }, meta);
  }

  delete<Data>(url: string, init?: RequestInit, meta: FetchMeta = {}) {
    return this.fetch<Data>(url, { ... init, method: 'DELETE' }, meta);
  }

}