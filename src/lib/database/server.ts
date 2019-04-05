import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';
import { CacheService } from '../cache/cache.service';

import { Query, DocsContentStyles } from './types';

export class DatabaseServerService {

    private Cache: CacheService;
    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'database');
        // cache
        this.Cache = this.app.Cache;
    }

    async all<Item>(sheet: string, cacheTime = 0): Promise<Item[]> {
        return await this.Cache.getRefresh(
            'data_' + sheet,
            this.Cache.cacheTime(cacheTime),
            async () => await this.Api.get('/', { sheet }),
        );
    }

    async query<Item>(sheet: string, query: Query, cacheTime = 0): Promise<Item[]> {
        return await this.Cache.getRefresh(
            'data_' + sheet + '_query_' + md5(JSON.stringify(query)),
            this.Cache.cacheTime(cacheTime),
            async () => await this.Api.get('/', { ... query, sheet }),
        );
    }

    async item<Item>(sheet: string, key: string, cacheTime = 0): Promise<Item> {
        return await this.Cache.getRefresh(
            'data_' + sheet + '_' + key,
            this.Cache.cacheTime(cacheTime),
            async () => await this.Api.get('/', { sheet, key }),
        );
    }

    async content(
        docId: string,
        styles: DocsContentStyles = 'clean',
        cacheTime = 0,
    ): Promise<{ docId?: string; content: string; }> {
        return await this.Cache.getRefresh(
            'content_' + docId + '_' + styles,
            this.Cache.cacheTime(cacheTime),
            async () => await this.Api.get('/content', { docId, styles }),
        );
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