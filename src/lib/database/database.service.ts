import { md5 } from '../utils';
import { AppService } from '../app/app.service';

import {
  Filter,
  DataParser,
  DataSegment,
  DocsContentStyle,
  ItemsOptions,
  ItemOptions,
} from './types';
import { DatabaseDirectService } from './direct';
import { DatabaseServerService } from './server';
import { DataFilterService } from './filter';

export class DatabaseService {

  private DatabaseServer: DatabaseServerService;
  private DatabaseDirect: DatabaseDirectService;
  private DataFilter: DataFilterService;

  private globalSegment: DataSegment;

  app: AppService;

  constructor(app: AppService) {
    // set app
    this.app = app;
    // instances
    this.DatabaseServer = new DatabaseServerService(this.app);
    this.DatabaseDirect = new DatabaseDirectService(this.app);
    this.DataFilter = new DataFilterService();
  }

  direct() {
    return this.DatabaseDirect;
  }

  server() {
    return this.DatabaseServer;
  }

  setSegmentation(globalSegment: DataSegment): DatabaseService {
    this.globalSegment = globalSegment;
    return this;
  }

  registerDataParser(parser: DataParser): DatabaseService {
    this.DatabaseDirect.registerDataParser(parser);
    return this;
  }

  /**
   * utils
   */

  private getItemsOptions(options: ItemsOptions): ItemsOptions {
    const {
      databaseUseCached = true,
      databaseCacheTime = 1440,
    } = this.app.options;
    const {
      useCached,
      cacheTime,
      segment,
      order,
      orderBy,
      limit,
      offset,
    } = options;
    return {
      useCached: (useCached === undefined) ? databaseUseCached : useCached,
      cacheTime: (cacheTime === undefined) ? databaseCacheTime : cacheTime,
      segment,
      order,
      orderBy,
      limit,
      offset,
    };
  }

  private getItemOptions(options: ItemOptions): ItemOptions {
    const {
      databaseAutoContent = true,
      databaseDocsStyle = 'full',
    } = this.app.options;
    const {
      autoContent,
      docsStyle,
    } = options;
    const itemsOptions = this.getItemsOptions(options);
    return {
      ... itemsOptions,
      autoContent: (autoContent === undefined) ? databaseAutoContent : autoContent,
      docsStyle: docsStyle || databaseDocsStyle,
    };
  }

  /**
   * general get
   */

  all<Item>(sheet: string, cacheTime = 1440) {
    return this.app.Cache.get(
      `database_${ sheet }`,
      async () => {
        // load from direct
        if (this.DatabaseDirect.hasAccess(sheet)) {
          try {
            return await this.DatabaseDirect.all<Item>(sheet);
          } catch (error) {
            // not published
            // or any errors
            throw new Error('Unable to access \'' + sheet + '\' directly, it may not be published.');
          }
        }
        // load from server
        else {
          return await this.DatabaseServer.all<Item>(sheet);
        }
      },
      cacheTime,
    );
  }

  async query<Item>(sheet: string, filter: Filter<Item>, options: ItemsOptions = {}) {
    const { useCached, segment, cacheTime } = this.getItemsOptions(options);
    return this.app.Cache.get(
      `database_${ sheet }_query_${ md5(JSON.stringify(filter)) }`,
      async () => {
        // server
        if (!useCached) {
          if (filter instanceof Function) {
            throw new Error('Can only use advanced filter with cached data.');
          }
          return this.DatabaseServer.query<Item>(sheet, filter, segment || this.globalSegment);
        }
        // cached
        else {
          // get all items
          const allItems = await this.all<Item>(sheet, cacheTime);
          // build filters
          const advancedFilter = this.DataFilter.buildAdvancedFilter(filter);
          const segmentFilter = this.DataFilter.buildSegmentFilter<Item>(
            segment || this.globalSegment,
          );
          // query local items
          const items = allItems.filter(item => (
            segmentFilter(item) && advancedFilter(item)
          ));
          return this.DataFilter.applyListingFilter(items, options);
        }
      },
      // only save query cache with server data
      (useCached ? 0 : cacheTime),
    );
  }

  // a proxy to all & query
  async items<Item>(
    sheet: string,
    filter?: Filter<Item>,
    options: ItemsOptions = {},
  ) {
    if (!!filter) {
      return this.query<Item>(sheet, filter, options);
    } else {
      const { cacheTime } = this.getItemsOptions(options);
      return this.all<Item>(sheet, cacheTime);
    }
  }

  async item<Item>(
    sheet: string,
    finder: string | number | Filter<Item>,
    options: ItemOptions = {},
  ) {
    const { useCached, cacheTime, docsStyle, autoContent } = this.getItemOptions(options);
    return this.app.Cache.get(null, async () => {
        let item: Item = null;
        // server
        if (!useCached) {
          if (typeof finder !== 'string') {
            throw new Error('Can only get item from server with item $key.');
          }
          item = await this.DatabaseServer.item(sheet, finder as string);
        }
        // cached
        else {
          // # finder
          if (typeof finder === 'number') {
            finder = { where: '#', equal: finder };
          }
          // $key finder
          if (typeof finder === 'string') {
            finder = { where: '$key', equal: finder };
          }
          // query items
          const items: Item[] = await this.query(sheet, finder, options);
          // extract item
          if ((items || []).length === 1) {
            item = items[0] as Item;
          }
        }
        // return final item
        return !!autoContent ? this.DatabaseDirect.fulfillItemContent(item, docsStyle) : item;
      },
      cacheTime,
      item => `database_${ sheet }_item_${ item['$key'] }`,
    );
  }

  // Google Docs html content
  docsContent(
    docId: string,
    docsStyle: DocsContentStyle = 'full',
    cacheTime = 1440,
  ) {
    return this.app.Cache.get<string>(
      `content_${ docId }_${ docsStyle }`,
      () => this.DatabaseDirect.docsContent(docId, docsStyle),
      cacheTime,
    );
  }

  // text-based content (txt, html, md, ...)
  textContent(url: string, cacheTime = 1440) {
    return this.app.Cache.get<string>(
      `content_${ md5(url) }`,
      () => this.DatabaseDirect.textContent(url),
      cacheTime,
    );
  }

  // json content
  jsonContent<Data>(url: string, cacheTime = 1440) {
    return this.app.Cache.get<Data>(
      `content_${ md5(url) }`,
      () => this.DatabaseDirect.jsonContent(url),
      cacheTime,
    );
  }

  /**
   * general set
   */

  set<Data>(sheet: string, key: string, data: Data) {
    return this.DatabaseServer.set(sheet, key, data);
  }

  update<Data>(sheet: string, key: string, data: Data) {
    return this.DatabaseServer.update(sheet, key, data);
  }

  add<Data>(sheet: string, key: string, data: Data) {
    return this.DatabaseServer.add(sheet, key, data);
  }

  remove(sheet: string, key: string) {
    return this.DatabaseServer.remove(sheet, key);
  }

  increase(
    sheet: string,
    key: string,
    increasing: string | string[] | {[path: string]: number},
  ) {
    return this.DatabaseServer.increase(sheet, key, increasing);
  }

  /**
   * manage cache
   */

  clearCachedAll(input: string | string[]) {
    // turn string to string[]
    input = (typeof input === 'string') ? [input] : input;
    // clear data
    for (const sheet of input) {
      this.app.Cache.removeByPrefix(`database_${ sheet }`);
    }
  }

  clearCachedItem(sheet: string, key: string) {
    return this.app.Cache.removeByPrefix(`database_${ sheet }_item_${ key }`);
  }

  // remove cached content by doc id or url
  clearCachedContent(cachedInput: string) {
    cachedInput = this.DatabaseDirect.isUrl(cachedInput) ? md5(cachedInput) : cachedInput;
    return this.app.Cache.removeByPrefix(`content_${ cachedInput }`);
  }

  /**
   * convinient get
   */

  itemsOriginal<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      item => (
        !item['origin'] ||
        item['origin'] === item['$key']
      ),
      options,
    );
  }

  itemsDraft<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      item => (
        !item['status'] ||
        item['status'] === 'draft'
      ),
      options,
    );
  }

  itemsPublished<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['status'] &&
        item['status'] === 'published'
      ),
      options,
    );
  }

  itemsArchived<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['status'] &&
        item['status'] === 'archived'
      ),
      options,
    );
  }

  async itemsByRelated<Item>(
    sheet: string,
    baseItem: Item,
    options: ItemsOptions = {},
  ) {
    // retrieve category & tag
    const { categories, tags } = baseItem as any;
    const categoryKey = (!categories || typeof categories === 'string') ?
      null : Object.keys(categories).shift();
    const tagKey = (!tags || typeof tags === 'string') ?
      null : Object.keys(tags).shift();
    // get all items
    const items = await this.items<Item>(sheet, null, options);
    // process items
    const matchedItems: Item[] = [];
    const unmatchedItems: Item[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // ignore the input item
      if (
        !!item['$key'] &&
        !!baseItem['$key'] &&
        (item['$key'] === baseItem['$key'])
      ) {
        continue;
      }
      // check other items
      if (
        (
          !!categoryKey &&
          !!item['categories'] &&
          !!item['categories'][categoryKey]
        ) ||
        (
          !!tagKey &&
          !!item['tags'] &&
          !!item['tags'][tagKey]
        )
      ) {
        matchedItems.push(item);
      } else {
        unmatchedItems.push(item);
      }
    }
    return [ ... matchedItems, ... unmatchedItems ];
  }

  itemsByType<Item>(
    sheet: string,
    type: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['type'] &&
        item['type'] === type
      ),
      options,
    );
  }

  itemsByTypeDefault<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      item => !item['type'],
      options,
    );
  }

  itemsByAuthor<Item>(
    sheet: string,
    authorKey: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['authors'] &&
        !!item['authors'][authorKey]
      ),
      options,
    );
  }

  itemsByLocale<Item>(
    sheet: string,
    locale: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['locale'] &&
        item['locale'] === locale
      ),
      options,
    );
  }

  itemsByOrigin<Item>(
    sheet: string,
    origin: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['origin'] &&
        item['origin'] === origin
      ),
      options,
    );
  }

  itemsByParent<Item>(
    sheet: string,
    parentKey: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['parents'] &&
        !!item['parents'][parentKey]
      ),
      options,
    );
  }

  itemsByTerm<Item>(
    sheet: string,
    taxonomy: string,
    termKey: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item[taxonomy] &&
        !!item[taxonomy][termKey]
      ),
      options,
    );
  }

  itemsByCategory<Item>(
    sheet: string,
    categoryKey: string,
    options: ItemsOptions = {},
  ) {
    return this.itemsByTerm<Item>(
      sheet,
      'categories',
      categoryKey,
      options,
    );
  }

  itemsByTag<Item>(
    sheet: string,
    tagKey: string,
    options: ItemsOptions = {},
  ) {
    return this.itemsByTerm<Item>(
      sheet,
      'tags',
      tagKey,
      options,
    );
  }

  itemsByKeyword<Item>(
    sheet: string,
    keyword: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['keywords'] &&
        item['keywords'].indexOf(keyword) > -1
      ),
      options,
    );
  }

  itemsByMetaExists<Item>(
    sheet: string,
    metaKey: string,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['meta'] &&
        !!item['meta'][metaKey]
      ),
      options,
    );
  }

  itemsByMetaEquals<Item>(
    sheet: string,
    metaKey: string,
    equalTo: any,
    options: ItemsOptions = {},
  ) {
    return this.items<Item>(
      sheet,
      item => (
        !!item['meta'] &&
        item['meta'][metaKey] === equalTo
      ),
      options,
    );
  }

  /**
   * convinient set
   */

  viewing(sheet: string, key: string) {
    return this.increase(sheet, key, 'viewCount');
  }

  liking(sheet: string, key: string) {
    return this.increase(sheet, key, 'likeCount');
  }

  commenting(sheet: string, key: string) {
    return this.increase(sheet, key, 'commentCount');
  }

  rating(sheet: string, key: string, stars: number) {
    return this.increase(sheet, key, {
      'rating/count': 1,
      'rating/total': stars,
    });
  }

  sharing(sheet: string, key: string, providers: string[] = []) {
    const customData = {};
    for (const provider of providers) {
      customData['sharing/' + provider] = 1;
    }
    return this.increase(sheet, key, {
      ... customData,
      'sharing/total': 1,
    });
  }

}