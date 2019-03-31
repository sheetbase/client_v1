import { AppService } from '../app/app.service';

import { Filter, AdvancedFilter, Query, DocsContentStyles } from './types';
import { DatabaseDirectService } from './direct';
import { DatabaseServerService } from './server';
import { buildQuery, buildAdvancedFilter } from './filter';

export class DatabaseService {

  private DatabaseDirect: DatabaseDirectService;
  private DatabaseServer: DatabaseServerService;

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
    this.DatabaseDirect = new DatabaseDirectService(this.app);
    this.DatabaseServer = new DatabaseServerService(this.app);
  }

  direct() {
    return this.DatabaseDirect;
  }

  server() {
    return this.DatabaseServer;
  }

  async all<Item>(sheet: string, cacheTime = 0) {
    let items: Item[];
    // first load from direct
    if (this.isDirect(sheet)) {
      try {
        items = await this.direct().all<Item>(sheet, cacheTime);
      } catch (error) {
        //
      }
    }
    // load from server
    if (!items) {
      items = await this.server().all<Item>(sheet, cacheTime);
    }
    return items;
  }

  async query<Item>(sheet: string, filter: Filter, offline = true, cacheTime = 0): Promise<Item[]> {
    // prepare query
    let query: Query;
    // advanced filter
    let advancedFilter: AdvancedFilter;
    if (filter instanceof Function) {
      advancedFilter = filter;
    } else {
      query = buildQuery(filter);
    }
    // query items
    if (offline) {
      // turn simple query into advanced query
      if (!advancedFilter) {
        advancedFilter = buildAdvancedFilter(query);
      }
      // load local items
      const localItems = await this.all(sheet, cacheTime);
      // query local items
      const items: Item[] = [];
      for (let i = 0, length = localItems.length; i < length; i++) {
        const item = localItems[i] as Item;
        if (!!advancedFilter(item)) {
          items.push(item);
        }
      }
      return items;
    } else {
      if (!advancedFilter) {
        return await this.server().query(sheet, query, cacheTime);
      } else {
        throw new Error('Can only apply advanced query with offline data.');
      }
    }
  }

  async items(sheet: string, filter?: Filter, offline = true, cacheTime = 0) {
    return !!filter ? this.query(sheet, filter, offline, cacheTime) : this.all(sheet, cacheTime);
  }

  async item<Item>(sheet: string, finder: string | Filter, offline = true, cacheTime = 0) {
    let item: Item = null;
    if (typeof finder === 'string' && !offline) {
      item = await this.server().item(sheet, finder, cacheTime);
    } else {
      // turn string into finder
      if (typeof finder === 'string') {
        finder = { $key: finder };
      }
      // query items
      const items: Item[] = await this.query(sheet, finder, offline, cacheTime);
      // extract item
      if ((items || []).length === 1) {
        item = items[0] as Item;
      }
    }
    return item;
  }

  async content(
    input: string, // id | doc url | published url
    styles: DocsContentStyles = 'minimal',
    cacheTime = 0,
  ) {
    if ( // server
      // doc id
      input.indexOf('http') < 0 ||
      // doc url
      (
        input.indexOf('https://docs.google.com/document/d/e/') < 0 &&
        input.indexOf('/pub') < 0
      )
    ) {
      // process content source
      const docId = input.replace('https://docs.google.com/document/d/', '').split('/')[0];
      return await this.server().content(docId, styles, cacheTime);
    } else { // direct
      return await this.direct().content(input, styles, cacheTime);
    }
  }

  async itemAndContent<Item>(
    sheet: string,
    finder: string | Filter,
    styles: DocsContentStyles = 'minimal',
    offline = true,
    cacheTime = 0,
  ) {
    let item: any = await this.item(sheet, finder, offline, cacheTime);
    if (
      !!item &&
      !item.content &&
      !!item.contentSource &&
      // must be: doc id | doc url | published url
      (
        item.contentSource.indexOf('http') < 0 ||
        item.contentSource.indexOf('https://docs.google.com/document/d/') > -1
      )
    ) {
      // get data
      const data = await this.content(item.contentSource, styles, cacheTime);
      // merge content to item
      item = { ... item, ... data };
    }
    // return final item
    return item as Item;
  }

  async set<Data>(sheet: string, key: string, data: Data) {
    return await this.server().set(sheet, key, data);
  }

  async update<Data>(sheet: string, key: string, data: Data) {
    return await this.server().update(sheet, key, data);
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
    return await this.server().increase(sheet, key, increasing);
  }

  private isDirect(sheet: string) {
    const { databasePublicId, databaseGids } = this.app.options;
    return !!databasePublicId && !!databaseGids && !!databaseGids[sheet];
  }

}