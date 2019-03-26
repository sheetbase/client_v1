import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Filter, AdvancedFilter, Query } from './types';

export class DatabaseService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'database');
    }

    async all<Item>(sheet: string, cacheTime = 0): Promise<Item[]> {
        return await this.Api.get('/', { sheet }, cacheTime);
    }

    async query<Item>(sheet: string, filter: Filter, offline = true, cacheTime = 0): Promise<Item[]> {
        // prepare query
        let where: string;
        let equal: any;
        let advancedFilter: AdvancedFilter;
        if (filter instanceof Function) {
            advancedFilter = filter;
        } else {
            const { where: filterWhere, equal: filterEqual } = filter as any;
            if (!!filterWhere) {
                where = filterWhere;
                equal = filterEqual;
            } else {
                where = Object.keys(filter)[0];
                equal = filter[where];
                delete filter[where]; // remove shorthand value from filter
            }
        }
        // query items
        if (offline) {
            // turn simple query into advanced query
            if (!advancedFilter) {
                // build advanced filter
                const {
                    exists,
                    contains,
                    lt, lte,
                    gt, gte,
                    childExists,
                    childEqual,
                } = filter as Query;
                if (!!equal) { // where/equal
                    advancedFilter = item => (!!item[where] && item[where] === equal);
                } else if (typeof exists === 'boolean') { // where/exists/not exists
                    advancedFilter = item => (!!exists ? !!item[where] : !item[where]);
                } else if (!!contains) { // where/contains
                    advancedFilter = item => (
                        !!item[where] &&
                        typeof item[where] === 'string' &&
                        item[where].indexOf(contains) > -1
                    );
                } else if (!!lt) { // where/less than
                    advancedFilter = item => (
                        !!item[where] &&
                        typeof item[where] === 'number' &&
                        item[where] < lt
                    );
                } else if (!!lte) { // where/less than or equal
                    advancedFilter = item => (
                        !!item[where] &&
                        typeof item[where] === 'number' &&
                        item[where] <= lte
                    );
                } else if (!!gt) { // where/greater than
                    advancedFilter = item => (
                        !!item[where] &&
                        typeof item[where] === 'number' &&
                        item[where] > gt
                    );
                } else if (!!gte) { // where/greater than or equal
                    advancedFilter = item => (
                        !!item[where] &&
                        typeof item[where] === 'number' &&
                        item[where] >= gte
                    );
                } else if (!!childExists) { // where/child exists, not exists
                    const notExists = childExists.substr(0, 1) === '!';
                    const child = notExists ? childExists.replace('!', '') : childExists;
                    advancedFilter = item => {
                        if (!item[where] && notExists) {
                            return true; // child always not exists
                        } else if (!!item[where]) {
                            if (item[where] instanceof Array) {
                                return notExists ?
                                    (item[where].indexOf(child) < 0) :
                                    (item[where].indexOf(child) > -1);
                            } else if (item[where] instanceof Object) {
                                return notExists ? !item[where][child] : !!item[where][child];
                            }
                        }
                        return false;
                    };
                } else if (!!childEqual) { // where/child equal, not equal
                    let notEqual: boolean;
                    let childKey: string;
                    let childValue: string;
                    if (childEqual.indexOf('!=') > -1) {
                        notEqual = true;
                        const keyValue = childEqual.split('!=').filter(Boolean);
                        childKey = keyValue[0];
                        childValue = keyValue[1];
                    } else {
                        const keyValue = childEqual.split('=').filter(Boolean);
                        childKey = keyValue[0];
                        childValue = keyValue[1];
                    }
                    advancedFilter = item => {
                        if (!item[where] && notEqual) {
                            return true; // always not equal
                        } else if (!!item[where]) {
                            return  (
                                item[where] instanceof Object &&
                                (notEqual ?
                                    (!item[where][childKey] || item[where][childKey] !== childValue) :
                                    (!!item[where][childKey] && item[where][childKey] === childValue)
                                )
                            );
                        }
                        return false;
                    };
                }
            }
            // load local items
            const localItems = await this.all(sheet);
            // query local items
            const items: Item[] = [];
            for (let i = 0; i < localItems.length; i++) {
                const item = localItems[i] as Item;
                if (!!advancedFilter(item)) {
                    items.push(item);
                }
            }
            return items;
        } else {
            if (!advancedFilter) {
                return await this.Api.get('/', { sheet, where, equal, ... filter }, cacheTime);
            } else {
                throw new Error('Can only apply advanced query when offline argument is true.');
            }
        }
    }

    async items(sheet: string, filter?: Filter, offline = true, cacheTime = 0) {
        return !!filter ? this.query(sheet, filter, offline, cacheTime) : this.all(sheet, cacheTime);
    }

    async item<Item>(sheet: string, finder: string | Filter, offline = true, cacheTime = 0) {
        let item: Item = null;
        if (typeof finder === 'string') {
            item = await this.Api.get('/', { sheet, key: finder }, cacheTime);
        } else {
            // query items
            const items: Item[] = await this.query(sheet, finder, offline, cacheTime);
            // extract item
            if ((items || []).length === 1) {
                item = items[0] as Item;
            }
        }
        return item;
    }

    async content(docId: string, withStyles = false, cacheTime = 0): Promise<{
        docId: string;
        content: string;
    }> {
        const query: any = { docId };
        if (withStyles) { query.withStyles = true; }
        return await this.Api.get('/content', query, cacheTime);
    }

    async itemAndContent<Item>(
        sheet: string,
        finder: string | Filter,
        offline = true,
        cacheTime = 0,
        withStyles = false,
    ) {
        let item: any = await this.item(sheet, finder, offline, cacheTime);
        if (!!item && !item.content && !!item.contentSource) {
            let docId: string = item.contentSource;
            // process content source
            if (docId.indexOf('https://docs.google.com/document/d/') > -1) {
                docId = docId.replace('https://docs.google.com/document/d/', '').split('/')[0];
            }
            // get data
            const data = await this.content(docId, withStyles, cacheTime);
            // merge content to item
            item = { ... item, ... data };
        }
        // return final item
        return item as Item;
    }

    async set<Data>(sheet: string, key: string, data: Data) {
        return await this.Api.post('/', {}, { sheet, key, data, clean: true });
    }

    async update<Data>(sheet: string, key: string, data: Data) {
        return await this.Api.post('/', {}, { sheet, key, data });
    }

    async add<Data>(sheet: string, key: string, data: Data) {
        return await this.update(sheet, key, data);
    }

    async remove(sheet: string, key: string) {
        return await this.update(sheet, key, null);
    }

    async increase(
        sheet: string,
        key: string,
        increasing: string | string[] | {[path: string]: number},
    ) {
        return await this.Api.post('/', {}, { sheet, key, increasing });
    }

}