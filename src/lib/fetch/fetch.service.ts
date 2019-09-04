import { md5 } from '../utils';
import { AppService } from '../app/app.service';

import { FetchMethodOptions } from './types';

export class FetchService {

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  fetch<Data>(
    input: RequestInfo,
    init?: RequestInit,
    options: FetchMethodOptions = {},
  ) {
    const { json = true, cacheTime = 0, cacheKey } = options;
    // get data
    return this.app.Cache.get(
      !!cacheKey ? cacheKey : ('fetch_' + md5(input as string)),
      async () => {
        const response = await fetch(input, init);
        if (!response.ok) {
          throw new Error('Fetch failed!');
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

  get<Data>(url: string, init?: RequestInit, options: FetchMethodOptions = {}) {
    return this.fetch<Data>(url, { ... init, method: 'GET' }, options);
  }

  post<Data>(url: string, init?: RequestInit, options: FetchMethodOptions = {}) {
    return this.fetch<Data>(url, { ... init, method: 'POST' }, options);
  }

  put<Data>(url: string, init?: RequestInit, options: FetchMethodOptions = {}) {
    return this.fetch<Data>(url, { ... init, method: 'PUT' }, options);
  }

  patch<Data>(url: string, init?: RequestInit, options: FetchMethodOptions = {}) {
    return this.fetch<Data>(url, { ... init, method: 'PATCH' }, options);
  }

  delete<Data>(url: string, init?: RequestInit, options: FetchMethodOptions = {}) {
    return this.fetch<Data>(url, { ... init, method: 'DELETE' }, options);
  }

}