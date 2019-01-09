import { SQLQuery, NoSQLQuery } from '@sheetbase/sheets-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class DatabaseService {
    private options: Options;
    private apiService: ApiService;

    constructor(options: Options) {
        this.options = {
            databaseEndpoint: 'database',
            ... options,
        };
        this.apiService = new ApiService(options);
    }

    endpoint(paths?: string | string[]) {
        return this.apiService.buildEndpoint(this.options.databaseEndpoint, paths);
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
        return await this.apiService.get(this.endpoint(), { table }, cache);
    }

    async item(
        table: string,
        idOrCondition: number | {[field: string]: string},
        cache = true,
    ) {
        return await this.apiService.get(this.endpoint(), {
            ... this.parseIdOrDocOrCondition(idOrCondition), table,
        }, cache);
    }

    async delete(
        table: string,
        idOrCondition: number | string | {[field: string]: string},
    ) {
        return await this.apiService.delete(this.endpoint(), {}, {
            ... this.parseIdOrDocOrCondition(idOrCondition), table,
        });
    }

    async collection(collection: string, returnObject = false, cache = true) {
        return await this.apiService.get(this.endpoint(), {
            collection, type: returnObject ? 'object' : 'list',
        }, cache);
    }

    async doc(collection: string, doc: string, cache = true) {
        return await this.apiService.get(this.endpoint(), { collection, doc }, cache);
    }

    async object(path: string, cache = true) {
        return await this.apiService.get(this.endpoint(), {
            path, type: 'object',
        }, cache);
    }

    async list(path: string, cache = true) {
        return await this.apiService.get(this.endpoint(), {
            path, type: 'list',
        }, cache);
    }

    async query(table: string, query: SQLQuery = {}, cache = true) {
        return await this.apiService.get(this.endpoint('query'), {
            ... query,
            table,
        }, cache);
    }

    async deepQuery(collection: string, query: NoSQLQuery = {}, cache = true) {
        return await this.apiService.get(this.endpoint('query'), {
            ... query,
            collection,
        }, cache);
    }

    async search(tableOrCollection: string, s: string, cache = true) {
        return await this.apiService.get(this.endpoint('search'), {
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
        return await this.apiService.post(this.endpoint(), {}, {
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
        return await this.apiService.post(this.endpoint(), {}, body);
    }

    async updates(
        updates: {[path: string]: any},
    ) {
        return await this.apiService.post(this.endpoint(), {}, { updates });
    }

}