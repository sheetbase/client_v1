import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Query, DocsContentStyles, DataSegment } from './types';

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

    async query<Item>(
        sheet: string,
        query: Query,
        cacheTime = 0,
        segment: DataSegment = null,
    ): Promise<Item[]> {
        return await this.app.Cache.getRefresh(
            'database_' + sheet + '_query_' + md5(JSON.stringify(query)),
            cacheTime,
            async () => await this.Api.get('/', { ... query, sheet, segment }),
        );
    }

    async item<Item>(sheet: string, key: string, cacheTime = 0): Promise<Item> {
        return await this.app.Cache.getRefresh(
            'database_' + sheet + '_' + key,
            cacheTime,
            async () => await this.Api.get('/', { sheet, key }),
        );
    }

    async docsContent(
        docUrl: string,
        style: DocsContentStyles = 'full',
        cacheTime = 0,
    ): Promise<{ docId?: string; content: string; }> {
        // get doc id
        const docId = docUrl
            .replace('https://docs.google.com/document/d/', '')
            .split('/')
            .shift();
        // get data
        return await this.app.Cache.getRefresh(
            'content_' + docId + '_' + style,
            cacheTime,
            async () => await this.Api.get('/content', { docId, style }),
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