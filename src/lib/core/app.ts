import ky from 'ky';
import { ResponseSuccess, ResponseError } from '@sheetbase/core-server';

import { Options } from './types';

export class Apps {
    private apps: { [name: string]: App };

    constructor() {}

    createApp(options: Options, name = 'DEFAULT') {
        if (!!this.apps[name]) {
            throw new Error(`App exists with the name "${name}".`);
        }
        this.apps[name] = new App(options);
        return this.apps[name];
    }

    removeApp(name: string) {
        delete this.apps[name];
    }

}

export class App {

    private options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    async get(
        endpoint?: string,
        params = {},
    ) {
        let url = this.buildUrl(endpoint, params);
        // if there is api key
        const { apiKey } = this.options;
        if (!!apiKey) {
            if (!endpoint && Object.keys(params).length < 1) {
              url += '?apiKey=' + apiKey;
            } else {
              url += '&apiKey=' + apiKey;
            }
        }
        // send request
        const data: ResponseSuccess & ResponseError = await ky.get(url).json() as any;
        if (data.error) {
            throw new Error(data.message);
        }
        return data;
    }

    async post(
        endpoint?: string,
        params = {},
        body = {},
    ) {
        const url = this.buildUrl(endpoint, params);
        body = { ... body, apiKey: this.options.apiKey };
        // send request
        const data: ResponseSuccess & ResponseError = await ky.post(url, { json: body }).json() as any;
        if (data.error) {
            throw new Error(data.message);
        }
        return data;
    }

    async put(
        endpoint?: string,
        params = {},
        body = {},
    ) {
        return await this.post(endpoint, { ... params, method: 'PUT' }, body);
    }

    async patch(
        endpoint?: string,
        params = {},
        body = {},
    ) {
        return await this.post(endpoint, { ... params, method: 'PATCH' }, body);
    }

    async delete(
        endpoint?: string,
        params = {},
        body = {},
    ) {
        return await this.post(endpoint, { ... params, method: 'DELETE' }, body);
    }

    buildUrl(endpoint?: string, params = {}): string {
        let { backendUrl: url } = this.options;
        if (endpoint) {
          url += '?e=' + endpoint;
        } else if (Object.keys(params).length > 0) {
          url += '?';
        }
        for (const key of Object.keys(params)) {
          url += `&${key}=${params[key]}`;
        }
        return url.replace('?&', '?');
    }

}