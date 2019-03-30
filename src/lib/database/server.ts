import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Query, DocsContentStyles } from './types';

export class DatabaseServerService {

    private app: AppService;
    private Api: ApiService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'database');
    }

    async all<Item>(sheet: string, cacheTime = 0): Promise<Item[]> {
        return await this.Api.get('/', { sheet }, cacheTime);
    }

    async query<Item>(sheet: string, query: Query, cacheTime = 0): Promise<Item[]> {
        return await this.Api.get('/', { ... query, sheet }, cacheTime);
    }

    async item<Item>(sheet: string, key: string, cacheTime = 0): Promise<Item> {
        return await this.Api.get('/', { sheet, key }, cacheTime);
    }

    async content(
        docId: string,
        styles: DocsContentStyles = 'minimal',
        cacheTime = 0,
    ): Promise<{ docId?: string; content: string; }> {
        return await this.Api.get('/content', { docId, styles }, cacheTime);
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