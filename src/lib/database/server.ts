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

  all<Item>(sheet: string): Promise<Item[]> {
    return this.Api.get('/', { sheet });
  }

  query<Item>(
    sheet: string,
    query: Query,
    segment: DataSegment = null,
  ): Promise<Item[]> {
    return this.Api.get('/', { ... query, sheet, segment });
  }

  item<Item>(sheet: string, key: string): Promise<Item> {
    return this.Api.get('/', { sheet, key });
  }

  async docsContent(
    docId: string,
    style: DocsContentStyle = 'full',
  ) {
    const result = await this.Api.get('/content', { docId, style });
    return result.content as string;
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