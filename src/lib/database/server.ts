import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Query, DocsContentStyle, DataSegment } from './types';

export class DatabaseServerService {

  private Api: ApiService;

  app: AppService;

  constructor(app: AppService, endpoint = 'database') {
    this.app = app;
    this.Api = this.app.Api
      .extend()
      .setEndpoint(endpoint);
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
    itemKey: string,
    docId: string,
    style: DocsContentStyle = 'full',
    cacheTime = 0,
  ) {
    const { content } = await this.app.Cache.getRefresh(
      'content_' + itemKey + '_' + docId + '_' + style,
      cacheTime,
      async () => await this.Api.get('/content', { docId, style }),
    );
    return content as string;
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