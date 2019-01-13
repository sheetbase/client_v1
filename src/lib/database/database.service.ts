import { SQLQuery, NoSQLQuery } from '@sheetbase/sheets-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class DatabaseService {
    private options: Options;
    private Api: ApiService;

    constructor(options: Options) {
        this.options = {
            databaseEndpoint: 'database',
            ... options,
        };
        this.Api = new ApiService(options)
            .setData({ endpoint: this.options.databaseEndpoint });
    }

    private parseIdOrDocOrCondition(input: number | string | {[field: string]: string}) {
        let result = {};
        if (typeof input === 'number') {
            result = { id: input };
        } else if (typeof input === 'string') {
            result = { doc: input };
        } else {
            const [ where ] = Object.keys(input);
            result = {
                where,
                equal: input[where],
            };
        }
        return result;
    }

    async all(table: string, cache = true) {
        return await this.Api.get('/', { table }, cache);
    }

    async item(
        table: string,
        idOrCondition: number | {[field: string]: string},
        cache = true,
    ) {
        return await this.Api.get('/', {
            ... this.parseIdOrDocOrCondition(idOrCondition), table,
        }, cache);
    }

    async delete(
        table: string,
        idOrCondition: number | string | {[field: string]: string},
    ) {
        return await this.Api.delete('/', {}, {
            ... this.parseIdOrDocOrCondition(idOrCondition), table,
        });
    }

    async collection(collection: string, returnObject = false, cache = true) {
        return await this.Api.get('/', {
            collection, type: returnObject ? 'object' : 'list',
        }, cache);
    }

    async doc(collection: string, doc: string, cache = true) {
        return await this.Api.get('/', { collection, doc }, cache);
    }

    async object(path: string, cache = true) {
        return await this.Api.get('/', {
            path, type: 'object',
        }, cache);
    }

    async list(path: string, cache = true) {
        return await this.Api.get('/', {
            path, type: 'list',
        }, cache);
    }

    async query(table: string, query: SQLQuery = {}, cache = true) {
        return await this.Api.get('/query', {
            ... query,
            table,
        }, cache);
    }

    async deepQuery(collection: string, query: NoSQLQuery = {}, cache = true) {
        return await this.Api.get('/query', {
            ... query,
            collection,
        }, cache);
    }

    async search(tableOrCollection: string, s: string, cache = true) {
        return await this.Api.get('/search', {
            table: tableOrCollection,
            collection: tableOrCollection,
            s,
        }, cache);
    }

    async updateDoc(
        collection: string,
        data: {},
        idOrDocOrCondition?: number | string | {[field: string]: string},
    ) {
        return await this.Api.post('/', {}, {
            ... this.parseIdOrDocOrCondition(idOrDocOrCondition), collection, data,
        });
    }

    async update(
        table: string,
        data: {},
        idOrCondition?: number | {[field: string]: string},
    ) {
        const body = {
            ... this.parseIdOrDocOrCondition(idOrCondition),
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