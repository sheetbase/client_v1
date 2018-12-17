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

    endpoint() {
        return '/' + this.options.databaseEndpoint;
    }

    /**
     * SQL
     */

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

    /**
     * NoSQL
     */

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

    async updateDoc(
        collection: string,
        data: {},
        idOrDocOrCondition?: number | string | {[field: string]: string},
    ) {
        return await this.apiService.post(this.endpoint() + '/doc', {}, {
            ... this.parseIdOrDocOrCondition(idOrDocOrCondition), collection, data,
        });
    }

    /**
     * Both
     */

    async query(tableOrCollection: string, query: SQLQuery | NoSQLQuery = {}, cache = true) {
        return await this.apiService.get(this.endpoint() + '/query', {
            ... query,
            table: tableOrCollection,
            collection: tableOrCollection,
        }, cache);
    }

    async search(tableOrCollection: string, s: string, cache = true) {
        return await this.apiService.get(this.endpoint() + '/search', {
            table: tableOrCollection,
            collection: tableOrCollection,
            s,
        }, cache);
    }

    async update(
        tableOrUpdates: string | {[path: string]: any},
        data?: {},
        idOrCondition?: number | {[field: string]: string},
    ) {
        let body = {};
        if (typeof tableOrUpdates === 'string') {
            body = {
                ... this.parseIdOrDocOrCondition(idOrCondition),
                table: tableOrUpdates,
                data,
            };
        } else {
            body = { updates: tableOrUpdates };
        }
        return await this.apiService.post(this.endpoint(), {}, body);
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

}