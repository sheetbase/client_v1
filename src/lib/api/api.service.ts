import { ResponseSuccess, ResponseError } from '@sheetbase/core-server';
import ky from 'kyx';
import { get as cacheGet, set as cacheSet } from 'lscache/lscache.min';

import { Options } from '../types';

export class ApiService {
    private options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    async request(inputs: {
        method?: string,
        endpoint?: string,
        params?: {},
        body?: {},
    } = {}) {
        const { method = 'get', endpoint = '/', params = {}, body = {} } = inputs;
        if (method.toLowerCase() === 'get') {
            return this.get(endpoint, params);
        } else if (method.toLowerCase() === 'post') {
            return this.post(endpoint, params, body);
        } else {
            return this.post(endpoint, { method, ... params }, body);
        }
    }

    async get(endpoint?: string, params = {}, cache = false) {
        const url = this.buildUrl(endpoint, params);
        // retrieve cache
        const cacheKey = url
            .replace('https://script.google.com/macros/s/', '')
            .replace(/\/|\.|\?|\&/g, '-');
        const cachedData = cacheGet(cacheKey);
        if (cache && !!cachedData) {
            return cachedData;
        }
        // send request
        const response: ResponseSuccess & ResponseError = await ky.get(url).json() as any;
        if (response.error) {
            throw new Error(response.code);
        }
        // save cache
        if (cache) {
            cacheSet(cacheKey, response.data, 60);
        }
        return response.data;
    }

    async post(endpoint?: string, params = {}, body = {}) {
        const url = this.buildUrl(endpoint, params);
        // send request
        const response: ResponseSuccess & ResponseError = await ky.post(url, { json: body }).json() as any;
        if (response.error) {
            throw new Error(response.code);
        }
        return response.data;
    }

    async put(endpoint?: string, params = {}, body = {}) {
        return await this.post(endpoint, { ... params, method: 'PUT' }, body);
    }

    async patch(endpoint?: string, params = {}, body = {}) {
        return await this.post(endpoint, { ... params, method: 'PATCH' }, body);
    }

    async delete(endpoint?: string, params = {}, body = {}) {
        return await this.post(endpoint, { ... params, method: 'DELETE' }, body);
    }

    private buildUrl(endpoint?: string, params = {}) {
        const { backendUrl, apiKey } = this.options;
        let url = backendUrl;
        if (!!apiKey) {
            params = { apiKey, ... params };
        }
        if (!!endpoint) {
          url += '?e=' + endpoint;
        } else if (Object.keys(params).length > 0) {
          url += '?';
        }
        for (const key of Object.keys(params)) {
          url += '&' + key + '=' + params[key];
        }
        return url.replace('?&', '?');
    }

}