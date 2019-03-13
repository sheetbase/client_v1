import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Filter, AdvancedFilter } from './types';

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
            }
        }
        // query items
        if (offline) {
            // load local items
            const localItems = await this.all(sheet);
            // turn where/equal to advance filter
            advancedFilter = advancedFilter || ((item: Item) => {
                return item[where] = equal;
            });
            // query local items
            const items: Item[] = [];
            for (let i = 0; i < localItems.length; i++) {
                const item = localItems[i] as Item;
                if (advancedFilter(item)) {
                    items.push(item);
                }
            }
            return items;
        } else {
            if (!advancedFilter) {
                return await this.Api.get('/', { sheet, where, equal }, cacheTime);
            } else {
                throw new Error('Can only apply advanced query with local data.');
            }
        }
    }

    async item<Item>(sheet: string, finder: string | Filter, offline = true, cacheTime = 0) {
        // turn key => { $key: finder }
        if (typeof finder === 'string') {
            finder = { $key: finder };
        }
        // query items
        const items: Item[] = await this.query(sheet, finder, offline, cacheTime);
        // extract item
        let item: Item = null;
        if (items.length === 1) {
            item = items[0] as Item;
        }
        return item;
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

}