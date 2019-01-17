import { ResponseSuccess, ResponseError } from '@sheetbase/core-server';
import { get as cacheGet, set as cacheSet } from 'lscache';
import * as _md5 from 'md5';
const md5 = _md5;

import { Options, BeforeRequest, ApiInstanceData } from '../types';

export class ApiService {
    private options: Options;
    private baseEndpoint: string;
    private predefinedQuery: {};
    private predefinedBody: {};
    private beforeRequest: BeforeRequest;

    constructor(options: Options) {
        this.options = options;
        this.baseEndpoint = '';
        this.predefinedQuery = {};
        this.predefinedBody = {};
        this.beforeRequest = async Api => {};
    }

    setData(data: ApiInstanceData = {}): ApiService {
        const { endpoint, query, body, before } = data;
        if (!!endpoint) { this.baseEndpoint = endpoint; }
        if (!!query) { this.predefinedQuery = query; }
        if (!!body) { this.predefinedBody = body; }
        if (!!before) { this.beforeRequest = before; }
        return this;
    }

    setEndpoint(endpoint: string): ApiService {
        this.baseEndpoint = endpoint;
        return this;
    }

    setQuery(query: {}): ApiService {
        this.predefinedQuery = {
            ... this.predefinedQuery,
            ... query,
        };
        return this;
    }

    setBody(body: {}): ApiService {
        this.predefinedBody = {
            ... this.predefinedBody,
            ... body,
        };
        return this;
    }

    setHookBefore(before: BeforeRequest): ApiService {
        this.beforeRequest = before;
        return this;
    }

    private async fetch(input: RequestInfo, init?: RequestInit) {
        const response = await fetch(input, init);
        if (!response.ok) {
            throw new Error('API fetch failed.');
        }
        return await response.json();
    }

    async request(inputs: {
        method?: string,
        endpoint?: string,
        query?: {},
        body?: {},
    } = {}) {
        const { method = 'get', endpoint = '/', query = {}, body = {} } = inputs;
        if (method.toLowerCase() === 'get') {
            return this.get(endpoint, query);
        } else if (method.toLowerCase() === 'post') {
            return this.post(endpoint, query, body);
        } else {
            return this.post(endpoint, { method, ... query }, body);
        }
    }

    async get(endpoint?: string, query = {}, cache = false) {
        await this.beforeRequest(this);
        // build url
        const url = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        // retrieve cache
        const cacheKey = md5(url);
        const cachedData = cacheGet(cacheKey);
        if (cache && !!cachedData) {
            return cachedData;
        }
        // send request
        const response: ResponseSuccess & ResponseError = await this.fetch(url, { method: 'GET' });
        if (response.error) {
            throw new Error(response.code);
        }
        // save cache
        if (cache) {
            cacheSet(cacheKey, response.data, 60);
        }
        return response.data;
    }

    async post(endpoint?: string, query = {}, body = {}) {
        await this.beforeRequest(this);
        // build url
        const url = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        // send request
        const response: ResponseSuccess & ResponseError = await this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(
                this.buildBody(body),
            ),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        if (response.error) {
            throw new Error(response.code);
        }
        return response.data;
    }

    async put(endpoint?: string, query = {}, body = {}) {
        return await this.post(endpoint, { ... query, method: 'PUT' }, body);
    }

    async patch(endpoint?: string, query = {}, body = {}) {
        return await this.post(endpoint, { ... query, method: 'PATCH' }, body);
    }

    async delete(endpoint?: string, query = {}, body = {}) {
        return await this.post(endpoint, { ... query, method: 'DELETE' }, body);
    }

    buildEndpoint(endpoint = '') {
        endpoint = '/' + this.baseEndpoint + '/' + endpoint; // add base
        endpoint = endpoint.replace(/\/+$/, ''); // remove trailing slash
        endpoint = endpoint.replace(/\/+/g, '/'); // remove repeated slashs
        return !!endpoint ? endpoint : '/';
    }

    buildQuery(query = {}) {
        let queryStr = '';
        query = { ... this.predefinedQuery, ... query };
        // has api key
        const { apiKey } = this.options;
        if (!!apiKey) {
            query = { apiKey, ... query };
        }
        // make the string
        for (const key of Object.keys(query)) {
            queryStr = queryStr + '&' + key + '=' + query[key];
        }
        return queryStr.replace(/^&/, '');
    }

    buildBody(body = {}) {
        return { ... this.predefinedBody, ... body };
    }

    buildUrl(endpoint = '', query = '') {
        let { backendUrl: url } = this.options;
        url += !!endpoint ? ('?e=' + endpoint) : (!!query ? '?' : '');
        return (!!query ? (url + '&' + query) : url).replace('?&', '?');
    }

}