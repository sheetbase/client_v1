import { ResponseSuccess, ResponseError } from '@sheetbase/core-server';
import { get as cacheGet, set as cacheSet } from 'lscache';
import * as _md5 from 'md5';
const md5 = _md5;

import { AppService } from '../app/app.service';
import { ApiException } from '../utils';

import { BeforeRequestHook, ApiInstanceData, ActionData } from './types';

export class ApiService {

    private baseEndpoint: string;
    private predefinedQuery: {};
    private predefinedBody: {};
    private beforeRequestHooks: BeforeRequestHook[];

    app: AppService;

    constructor(app: AppService, instanceData: ApiInstanceData = {}) {
        this.app = app;

        // dafault instance data
        this.baseEndpoint = '';
        this.predefinedQuery = {};
        this.predefinedBody = {};
        this.beforeRequestHooks = [];
        // set data
        this.setData(instanceData);
    }

    extend() {
        return new ApiService(this.app, {
            endpoint: this.baseEndpoint,
            query: this.predefinedQuery,
            body: this.predefinedBody,
            beforeHooks: this.beforeRequestHooks,
        });
    }

    setData(data: ApiInstanceData): ApiService {
        const { endpoint, query, body, beforeHooks } = data;
        if (!!endpoint) { this.baseEndpoint = endpoint; }
        if (!!query) { this.predefinedQuery = query; }
        if (!!body) { this.predefinedBody = body; }
        if (!!beforeHooks) { this.beforeRequestHooks = beforeHooks; }
        return this;
    }

    setEndpoint(endpoint: string): ApiService {
        this.baseEndpoint = endpoint;
        return this;
    }

    addQuery(query: {}): ApiService {
        this.predefinedQuery = {
            ... this.predefinedQuery,
            ... query,
        };
        return this;
    }

    addBody(body: {}): ApiService {
        this.predefinedBody = {
            ... this.predefinedBody,
            ... body,
        };
        return this;
    }

    addBeforeHooks(hooks: BeforeRequestHook[]): ApiService {
        this.beforeRequestHooks = [
            ... this.beforeRequestHooks,
            ... hooks,
        ];
        return this;
    }

    private async fetch(input: RequestInfo, init?: RequestInit) {
        const response = await fetch(input, init);
        if (!response.ok) {
            throw new Error('API fetch failed.');
        }
        const result: ResponseSuccess & ResponseError = await response.json();
        if (result.error) {
            throw new ApiException(result);
        }
        return result.data;
    }

    private async runBeforeHooks(data: ActionData) {
        for (let i = 0; i < this.beforeRequestHooks.length; i++) {
            data = await this.beforeRequestHooks[i](data);
        }
        return data;
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
        const data = await this.fetch(url, { method: 'GET' });
        // save cache
        if (cache) {
            cacheSet(cacheKey, data, 60);
        }
        return data;
    }

    async post(endpoint?: string, query = {}, body = {}) {
        // build url
        const url = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        // send request
        return await this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(
                this.buildBody(body),
            ),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
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
        const { apiKey } = this.app.options;
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
        let { backendUrl: url } = this.app.options;
        url += !!endpoint ? ('?e=' + endpoint) : (!!query ? '?' : '');
        return (!!query ? (url + '&' + query) : url).replace('?&', '?');
    }

}