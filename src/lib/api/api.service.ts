import { md5 } from '../utils';
import { AppService } from '../app/app.service';

import {
    BeforeRequestHook,
    ApiInstanceData,
    ActionData,
    ResponseSuccess,
    ResponseError,
} from './types';

export function ApiError (result: ResponseError) {
    this.name = 'ApiError';
    this.message = result.message;
    this.error = result;
}

export class ApiService {

    private baseEndpoint: string;
    private predefinedQuery: {};
    private predefinedBody: {};
    private beforeRequestHooks: BeforeRequestHook[];

    app: AppService;

    constructor(app: AppService, instanceData: ApiInstanceData = {}) {
        this.app = app;

        // dafault instance data
        const { apiKey } = this.app.options;
        this.baseEndpoint = '';
        this.predefinedQuery = !!apiKey ? { key: apiKey } : {};
        this.predefinedBody = {};
        this.beforeRequestHooks = [];
        // set custom data
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

    addBeforeHooks(hooks: BeforeRequestHook | BeforeRequestHook[]): ApiService {
        if (hooks instanceof Function) {
            hooks = [hooks];
        }
        this.beforeRequestHooks = [
            ... this.beforeRequestHooks,
            ... hooks,
        ];
        return this;
    }

    private buildEndpoint(endpoint = '') {
        endpoint = '/' + this.baseEndpoint + '/' + endpoint; // add base
        endpoint = endpoint.replace(/\/+$/, ''); // remove trailing slash
        endpoint = endpoint.replace(/\/+/g, '/'); // remove repeated slashs
        return !!endpoint ? endpoint : '/';
    }

    private buildQuery(query = {}) {
        query = { ... this.predefinedQuery, ... query };
        // make the string
        let queryStr = '';
        for (const key of Object.keys(query)) {
            queryStr = queryStr + '&' + key + '=' + query[key];
        }
        return queryStr.replace(/^&/, '');
    }

    private buildBody(body = {}) {
        return { ... this.predefinedBody, ... body };
    }

    private buildUrl(endpoint = '', query = '') {
        let { backendUrl: url = '' } = this.app.options;
        url += !!endpoint ? ('?e=' + endpoint) : (!!query ? '?' : '');
        return (!!query ? (url + '&' + query) : url).replace('?&', '?');
    }

    private async runHooks(hook: 'before' | 'after', data: ActionData) {
        const hooks = hook === 'before' ? this.beforeRequestHooks : [];
        for (let i = 0; i < hooks.length; i++) {
            data = await hooks[i](data);
        }
        return data;
    }

    private async fetch(input: RequestInfo, init?: RequestInit) {
        const result = await this.app.Fetch.fetch<ResponseSuccess & ResponseError>(input, init, true);
        if (result.error) {
            throw new ApiError(result);
        }
        return result.data;
    }

    request(inputs: {
        method?: string,
        endpoint?: string,
        query?: {},
        body?: {},
        cacheTime?: number;
    } = {}) {
        const { method = 'get', endpoint = '/', query = {}, body = {}, cacheTime = 0 } = inputs;
        if (method.toLowerCase() === 'get') {
            return this.get(endpoint, query, cacheTime);
        } else if (method.toLowerCase() === 'post') {
            return this.post(endpoint, query, body);
        } else {
            return this.post(endpoint, { method, ... query }, body);
        }
    }

    async get(endpoint?: string, query = {}, cacheTime = 0) {
        const originalUrl = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        // run hooks
        const beforeHookResult = await this.runHooks('before', {
            endpoint, query, body: {},
        });
        endpoint = beforeHookResult.endpoint;
        query = beforeHookResult.query;
        // build url
        const url = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        return this.app.Cache.get(
            'api_' + md5(originalUrl),
            () => this.fetch(url, { method: 'GET' }),
            cacheTime,
        );
    }

    async post(endpoint?: string, query = {}, body = {}) {
        const beforeHookResult = await this.runHooks('before', {
            endpoint, query, body,
        });
        endpoint = beforeHookResult.endpoint;
        query = beforeHookResult.query;
        body = beforeHookResult.body;
        // build url
        const url = this.buildUrl(
            this.buildEndpoint(endpoint),
            this.buildQuery(query),
        );
        // send request
        return this.fetch(url, {
            method: 'POST',
            body: JSON.stringify(
                this.buildBody(body),
            ),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    put(endpoint?: string, query = {}, body = {}) {
        return this.post(endpoint, { ... query, method: 'PUT' }, body);
    }

    patch(endpoint?: string, query = {}, body = {}) {
        return this.post(endpoint, { ... query, method: 'PATCH' }, body);
    }

    delete(endpoint?: string, query = {}, body = {}) {
        return this.post(endpoint, { ... query, method: 'DELETE' }, body);
    }

}