import ky from 'kyx';
import { ResponseSuccess, ResponseError } from '@sheetbase/core-server';

import { App } from '../app';

export class ApiService {
    private app: App;

    constructor(app: App) { this.app = app; }

    async get(endpoint?: string, params = {}) {
        const url = this.buildUrl(endpoint, params);
        // send request
        const data: ResponseSuccess & ResponseError = await ky.get(url).json() as any;
        if (data.error) {
            throw new Error(data.message);
        }
        return data;
    }

    async post(endpoint?: string, params = {}, body = {}) {
        const url = this.buildUrl(endpoint, params);
        // send request
        const data: ResponseSuccess & ResponseError = await ky.post(url, { json: body }).json() as any;
        if (data.error) {
            throw new Error(data.message);
        }
        return data;
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
        const { backendUrl, apiKey } = this.app.options();
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