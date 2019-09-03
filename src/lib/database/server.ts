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

  all<Item>(sheet: string, cacheTime = 0): Promise<Item[]> {
    return this.app.Cache.getRefresh(
      'database_' + sheet,
      () => this.Api.get('/', { sheet }, -1),
      cacheTime,
    );
  }

  query<Item>(
    sheet: string,
    query: Query,
    cacheTime = 0,
    segment: DataSegment = null,
  ): Promise<Item[]> {
    return this.app.Cache.getRefresh(
      'database_' + sheet + '_query_' + md5(JSON.stringify(query)),
      () => this.Api.get('/', { ... query, sheet, segment }, -1),
      cacheTime,
    );
  }

  item<Item>(sheet: string, key: string, cacheTime = 0): Promise<Item> {
    return this.app.Cache.getRefresh(
      'database_' + sheet + '_' + key,
      () => this.Api.get('/', { sheet, key }, -1),
      cacheTime,
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
      () => this.Api.get('/content', { docId, style }, -1),
      cacheTime,
    );
    return content as string;
  }

  set<Data>(sheet: string, key: string, data: Data) {
    return this.Api.post('/', {}, { sheet, key, data, clean: true });
  }

  update<Data>(sheet: string, key: string, data: Data) {
    return this.Api.post('/', {}, { sheet, key, data });
  }

  add<Data>(sheet: string, key: string, data: Data) {
    return this.update(sheet, key, data);
  }

  remove(sheet: string, key: string) {
    return this.update(sheet, key, null);
  }

  increase(
    sheet: string,
    key: string,
    increasing: string | string[] | {[path: string]: number},
  ) {
    return this.Api.post('/', {}, { sheet, key, increasing });
  }

}