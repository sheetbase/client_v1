import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Query, DocsContentStyles } from './types';

export class DatabaseServerService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'database');
    }

    async all<Item>(sheet: string, cacheTime = 0): Promise<Item[]> {
        return await this.app.Cache.getRefresh(
            'database_' + sheet,
            cacheTime,
            async () => await this.Api.get('/', { sheet }),
        );
    }

    async query<Item>(sheet: string, query: Query, cacheTime = 0): Promise<Item[]> {
        return await this.app.Cache.getRefresh(
            'database_' + sheet + '_query_' + md5(JSON.stringify(query)),
            cacheTime,
            async () => await this.Api.get('/', { ... query, sheet }),
        );
    }

    async item<Item>(sheet: string, key: string, cacheTime = 0): Promise<Item> {
        return await this.app.Cache.getRefresh(
            'database_' + sheet + '_' + key,
            cacheTime,
            async () => await this.Api.get('/', { sheet, key }),
        );
    }

    async content(
        urlOrDocId: string,
        styles: DocsContentStyles = 'clean',
        cacheTime = 0,
    ): Promise<{ docId?: string; content: string; }> {
        // process content source
        const docId = urlOrDocId
            .replace('https://docs.google.com/document/d/', '')
            .split('/')
            .shift();
        return await this.app.Cache.getRefresh(
            'content_' + docId + '_' + styles,
            cacheTime,
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