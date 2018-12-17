import { SQLQuery, NoSQLQuery } from '@sheetbase/sheets-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

// TODO: add cache

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

    async all(table: string) {
        return await this.apiService.get(this.endpoint(), { table });
    }

    async item(
        table: string,
        idOrCondition: number | {[field: string]: string},
    ) {
        return await this.apiService.get(this.endpoint(), {
            ... this.parseIdOrDocOrCondition(idOrCondition), table,
        });
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

    async collection(collection: string, returnObject = false) {
        return await this.apiService.get(this.endpoint(), {
            collection, type: returnObject ? 'object' : 'list',
        });
    }

    async doc(collection: string, doc: string) {
        return await this.apiService.get(this.endpoint(), { collection, doc });
    }

    async object(path: string) {
        return await this.apiService.get(this.endpoint(), {
            path, type: 'object',
        });
    }

    async list(path: string) {
        return await this.apiService.get(this.endpoint(), {
            path, type: 'list',
        });
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

    async query(tableOrCollection: string, query: SQLQuery | NoSQLQuery = {}) {
        return await this.apiService.get(this.endpoint() + '/query', {
            ... query,
            table: tableOrCollection,
            collection: tableOrCollection,
        });
    }

    async search(tableOrCollection: string, s: string) {
        return await this.apiService.get(this.endpoint() + '/search', {
            table: tableOrCollection,
            collection: tableOrCollection,
            s,
        });
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