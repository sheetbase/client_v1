import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import { Query, DocsContentStyle, DataSegment } from './types';

export class DatabaseServerService {

  private Api: ApiService;

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
    this.Api = this.app.Api
      .extend()
      .setEndpoint(this.app.options.databaseEndpoint || 'database');
  }

  all<Item>(sheet: string) {
    return this.Api.get<Item[]>('/', { sheet });
  }

  query<Item>(sheet: string, query: Query, segment?: DataSegment) {
    const params: any = { sheet };
    params['query'] = encodeURIComponent(JSON.stringify(query));
    if (!!segment) {
      params['segment'] = encodeURIComponent(JSON.stringify(segment));
    }
    return this.Api.get<Item[]>('/', params);
  }

  item<Item>(sheet: string, key: string) {
    return this.Api.get<Item>('/', { sheet, key });
  }

  async docsContent(docId: string, style: DocsContentStyle = 'full') {
    const result = await this.Api.get<{docId: string, content: string}>(
      '/content', { docId, style },
    );
    return result.content;
  }

  set<Data>(sheet: string, key: string, data: Data) {
    return this.Api.post<any>('/', {}, { sheet, key, data, clean: true });
  }

  update<Data>(sheet: string, key: string, data: Data) {
    return this.Api.post<any>('/', {}, { sheet, key, data });
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
    return this.Api.post<any>('/', {}, { sheet, key, increasing });
  }

}