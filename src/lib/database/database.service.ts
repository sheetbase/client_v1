import { md5 } from '../../md5/md5';

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

  /**
   * utils
   */

  private isDirect(sheet: string) {
    const { databaseId, databaseGids } = this.app.options;
    return !!databaseId && !!databaseGids && !!databaseGids[sheet];
  }

  private isContentUrl(contentSource: string) {
    return (
      !!contentSource &&
      // must be an url (not implicit excluded - starts with @)
      (
        contentSource.substr(0, 4) === 'http' &&
        contentSource.indexOf('://') > -1
      )
    );
  }

  private isDocUrl(contentSource: string) {
    return contentSource.indexOf('https://docs.google.com/document/d/') > -1;
  }

  private contentId(contentSource: string) {
    return !this.isDocUrl(contentSource) ?
      md5(contentSource) :
      contentSource.replace('https://docs.google.com/document/d/', '')
      .split('/')
      .shift();
  }

  /**
   * instances
   */

  direct() {
    return this.DatabaseDirect;
  }

  server() {
    return this.DatabaseServer;
  }

  /**
   * get data
   */

  async all<Item>(sheet: string, cacheTime = 0) {
    let items: Item[] = [];
    // first load from direct
    if (this.isDirect(sheet)) {
      try {
        items = await this.direct().all<Item>(sheet, cacheTime);
      } catch (error) {
        // not published
      }
    }
    // load from server
    if (!items) {
      items = await this.server().all<Item>(sheet, cacheTime);
    }
    return items;
  }

  async query<Item>(sheet: string, filter: Filter, useCached = true, cacheTime = 0): Promise<Item[]> {
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
    if (useCached) {
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
        throw new Error('Can only apply advanced query with cached data.');
      }
    }
  }

  async items<Item>(sheet: string, filter?: Filter, useCached = true, cacheTime = 0) {
    return !!filter ?
      this.query<Item>(sheet, filter, useCached, cacheTime) :
      this.all<Item>(sheet, cacheTime);
  }

  async item<Item>(
    sheet: string,
    finder: string | Filter,
    useCached = true,
    cacheTime = 0,
    docsStyle: DocsContentStyles = 'original',
  ) {
    let item: Item;
    // get item
    if (typeof finder === 'string' && !useCached) { // from server
      item = await this.server().item(sheet, finder, cacheTime);
    } else { // from cached
      // turn string into finder
      if (typeof finder === 'string') {
        finder = { $key: finder };
      }
      // query items
      const items: Item[] = await this.query(sheet, finder, useCached, cacheTime);
      // extract item
      if ((items || []).length === 1) {
        item = items[0] as Item;
      }
    }
    // get content from source
    const contentSource: string = item['contentSource'];
    if (
      !!item &&
      !item['content'] &&
      this.isContentUrl(contentSource)
    ) {
      item['content'] = await this.content(contentSource, cacheTime, docsStyle);
    }
    // return final item
    return item;
  }

  async content(
    url: string,
    cacheTime = 0,
    docsStyle: DocsContentStyles = 'original',
  ) {
    if (this.isDocUrl(url)) {
      const { content } = await this.direct().docsContent(url, docsStyle, cacheTime);
      return content;
    } else {
      return await this.app.Cache.getRefresh<string>(
        'content_' + md5(url) + '_original',
        cacheTime,
        async () => await this.app.Fetch.get(url, {}, { json: false }),
      );
    }
  }

  /**
   * set value
   */

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

  /**
   * manage cache
   */

  async clearCachedAll(input: string | string[]) {
    // turn string to string[]
    if (typeof input === 'string') {
      input = [input];
    }
    // clear data
    for (let i = 0; i < input.length; i++) {
      await this.app.Cache.removeByPrefix('database_' + input[i]);
    }
  }

  async clearCachedItem<Item>(sheet: string, item: Item) {
    // clear all associated data
    await this.clearCachedAll(sheet);
    // clear content
    const contentSource: string = item['contentSource'];
    if (this.isContentUrl(contentSource)) {
      const id = this.contentId(contentSource);
      await this.app.Cache.removeByPrefix('content_' + id + '_clean');
      await this.app.Cache.removeByPrefix('content_' + id + '_full');
      await this.app.Cache.removeByPrefix('content_' + id + '_original');
    }
  }

  /**
   * data utils
   */

}