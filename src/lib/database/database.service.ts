import { SQLQuery, NoSQLQuery } from '@sheetbase/sheets-server';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

export class DatabaseService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'database');
    }

    private convertFinder(finder: number | string | {[field: string]: string}) {
        let result = {};
        if (typeof finder === 'number') {
            result = { id: finder };
        } else if (typeof finder === 'string') {
            result = { doc: finder };
        } else {
            const [ where ] = Object.keys(finder);
            result = {
                where,
                equal: finder[where],
            };
        }
        return result;
    }

    async all(table: string, cacheTime = 0) {
        return await this.Api.get('/', { table }, cacheTime);
    }

    async item(
        table: string,
        idOrCondition: number | {[field: string]: string},
        cacheTime = 0,
    ) {
        return await this.Api.get('/', {
            ... this.convertFinder(idOrCondition), table,
        }, cacheTime);
    }

    async delete(
        table: string,
        idOrCondition: number | string | {[field: string]: string},
    ) {
        return await this.Api.delete('/', {}, {
            ... this.convertFinder(idOrCondition), table,
        });
    }

    async collection(collection: string, returnObject = false, cacheTime = 0) {
        return await this.Api.get('/', {
            collection, type: returnObject ? 'object' : 'list',
        }, cacheTime);
    }

    async doc(collection: string, doc: string, cacheTime = 0) {
        return await this.Api.get('/', { collection, doc }, cacheTime);
    }

    async object(path: string, cacheTime = 0) {
        return await this.Api.get('/', {
            path, type: 'object',
        }, cacheTime);
    }

    async list(path: string, cacheTime = 0) {
        return await this.Api.get('/', {
            path, type: 'list',
        }, cacheTime);
    }

    async query(table: string, query: SQLQuery = {}, cacheTime = 0) {
        return await this.Api.get('/query', {
            ... query,
            table,
        }, cacheTime);
    }

    async deepQuery(collection: string, query: NoSQLQuery = {}, cacheTime = 0) {
        return await this.Api.get('/query', {
            ... query,
            collection,
        }, cacheTime);
    }

    async search(tableOrCollection: string, s: string, cacheTime = 0) {
        return await this.Api.get('/search', {
            table: tableOrCollection,
            collection: tableOrCollection,
            s,
        }, cacheTime);
    }

    async updateDoc(
        collection: string,
        data: {},
        idOrDocOrCondition?: number | string | {[field: string]: string},
    ) {
        return await this.Api.post('/', {}, {
            ... this.convertFinder(idOrDocOrCondition), collection, data,
        });
    }

    async update(
        table: string,
        data: {},
        idOrCondition?: number | {[field: string]: string},
    ) {
        const body = {
            ... this.convertFinder(idOrCondition),
            table,
            data,
        };
        return await this.Api.post('/', {}, body);
    }

    async updates(
        updates: {[path: string]: any},
    ) {
        return await this.Api.post('/', {}, { updates });
    }

}