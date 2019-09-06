import { md5 } from '../utils';
import { AppService } from '../app/app.service';

import {
  Filter,
  AdvancedFilter,
  Query,
  DataParser,
  DataSegment,
  DocsContentStyle,
  ItemsOptions,
  ItemOptions,
} from './types';
import { DatabaseDirectService } from './direct';
import { DatabaseServerService } from './server';
import { buildQuery, buildAdvancedFilter, buildSegmentFilter } from './filter';

export class DatabaseService {

  private BUILTIN_PUBLIC_GIDS = {
    categories: '101',
    tags: '102',
    pages: '103',
    posts: '104',
    authors: '105',
    threads: '106',
    options: '108',
    bundles: '111',
    audios: '112',
    videos: '113',
    products: '114',
    notifications: '181',
    promotions: '182',
  };
  private AUTO_LOADED_JSON_SCHEME = 'json://';
  private AUTO_LOADED_TEXT_SCHEME = 'content://';

  private DatabaseDirect: DatabaseDirectService;
  private DatabaseServer: DatabaseServerService;

  private globalSegment: DataSegment;

  app: AppService;

  constructor(app: AppService) {
    const { databaseEndpoint, databaseId, databaseGids } = app.options;
    // set app
    this.app = app;
    // create instances
    this.DatabaseDirect = new DatabaseDirectService(
      this.app,
      databaseId,
      {
        ... this.BUILTIN_PUBLIC_GIDS,
        ... databaseGids,
      },
    );
    this.DatabaseServer = new DatabaseServerService(
      this.app,
      databaseEndpoint,
    );
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

  private buildItemsOptions(options: ItemsOptions): ItemsOptions {
    const {
      useCached = true,
      cacheTime = 1440,
      segment,
      order,
      orderBy,
      limit,
      offset,
    } = options;
    return {
      useCached,
      cacheTime,
      segment,
      order,
      orderBy,
      limit,
      offset,
    };
  }

  private buildItemOptions(options: ItemOptions): ItemOptions {
    const {
      docsStyle = 'full',
      autoLoaded = true,
    } = options;
    const itemsOptions = this.buildItemsOptions(options);
    return { ... itemsOptions, docsStyle, autoLoaded };
  }

  // is this sheet available for direct access
  private hasDirectAccess(sheet: string) {
    const { databaseId, databaseGids = {} } = this.app.options;
    return (
      !!databaseId &&
      (
        !!this.BUILTIN_PUBLIC_GIDS[sheet] ||
        !!databaseGids[sheet]
      )
    );
  }

  // possibly a url
  private isUrl(value: string) {
    return (
      value.substr(0, 7) === 'http://' ||
      value.substr(0, 8) === 'https://'
    );
  }

  private isFileId(id: string) {
    // example: 17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W
    // usually an 33 characters id, and starts with 1
    return (
      id.substr(0, 1) === '1' &&
      id.length > 31 &&
      id.length < 35
    );
  }

  private isDocId(id: string) {
    // example: 1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc
    // usually an 44 characters id, and starts with 1
    return (
      id.substr(0, 1) === '1' &&
      id.length > 42 &&
      id.length < 46
    );
  }

  // return url to resource or a doc id
  private buildAutoLoadedValue(rawValue: string, scheme: string) {
    let value = rawValue.replace(scheme, '');
    if (
      !this.isUrl(value) &&
      this.isFileId(value)
    ) {
      value = 'https://drive.google.com/uc?id=' + value;
    }
    return value;
  }

  /**
   * general get
   */

  all<Item>(sheet: string, cacheTime = 1440) {
    return this.app.Cache.get(
      'database_' + sheet,
      async () => {
        // load from direct
        if (this.hasDirectAccess(sheet)) {
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

  async query<Item>(
    sheet: string,
    filter: Filter,
    options: ItemsOptions = {},
  ): Promise<Item[]> {
    const { useCached, cacheTime, segment } = this.buildItemsOptions(options);
    // prepare
    let query: Query; // prepare query
    let advancedFilter: AdvancedFilter; // advanced filter
    if (filter instanceof Function) {
      advancedFilter = filter;
    } else {
      query = buildQuery(filter);
    }
    // query items
    if (useCached) {
      // turn simple query into advanced filter
      if (!advancedFilter) {
        advancedFilter = buildAdvancedFilter(query);
      }
      // build segment filter
      const segmentFilter = buildSegmentFilter<Item>(segment || this.globalSegment);
      // load local items
      const allItems = await this.all(sheet, cacheTime);
      // query local items
      const items: Item[] = [];
      for (let i = 0, length = allItems.length; i < length; i++) {
        const item = allItems[i] as Item;
        if (
          !!segmentFilter(item) &&
          !!advancedFilter(item)
        ) {
          items.push(item);
        }
      }
      return items;
    } else {
      if (!advancedFilter) {
        return this.app.Cache.get(
          'database_' + sheet + '_query_' + md5(JSON.stringify(query)),
          () => this.DatabaseServer.query(sheet, query, segment),
          cacheTime,
        );
      } else {
        throw new Error('Can only apply advanced query with cached data.');
      }
    }
  }

  async items<Item>(
    sheet: string,
    filter?: Filter,
    options: ItemsOptions = {},
  ) {
    if (!!filter) {
      return this.query<Item>(sheet, filter, options);
    } else {
      const { cacheTime } = this.buildItemsOptions(options);
      return this.all<Item>(sheet, cacheTime);
    }
  }

  async item<Item>(
    sheet: string,
    finder: string | Filter,
    options: ItemOptions = {},
  ) {
    const { useCached, cacheTime, docsStyle, autoLoaded } = this.buildItemOptions(options);
    // get item
    let item: Item;
    // from server
    if (typeof finder === 'string' && !useCached) {
      const key = finder;
      item = await this.app.Cache.get(
        'database_' + sheet + '_item_' + key,
        () => this.DatabaseServer.item(sheet, key),
        cacheTime,
      );
    }
    // from cached
    else {
      // turn string into finder
      if (typeof finder === 'string') {
        finder = { $key: finder };
      }
      // query items
      const items: Item[] = await this.query(sheet, finder, options);
      // extract item
      if ((items || []).length === 1) {
        item = items[0] as Item;
      }
    }
    // load auto-loaded values
    if (!!autoLoaded) {
      // must associated with this item
      const itemKey = item['$key'];
      // check all props and load values
      for (const prop of Object.keys(item)) {
        const propValue = item[prop];
        // auto-loaded json://
        if (
          typeof propValue === 'string' &&
          propValue.substr(0, this.AUTO_LOADED_JSON_SCHEME.length) === this.AUTO_LOADED_JSON_SCHEME
        ) {
          // load and overwrite the data
          const autoLoadedValue = this.buildAutoLoadedValue(propValue, this.AUTO_LOADED_JSON_SCHEME);
          item[prop] = await this.jsonContent(itemKey, autoLoadedValue, cacheTime);
        }
        // auto-loaded content://
        if (
          typeof propValue === 'string' &&
          propValue.substr(0, this.AUTO_LOADED_TEXT_SCHEME.length) === this.AUTO_LOADED_TEXT_SCHEME
        ) {
          const autoLoadedValue = this.buildAutoLoadedValue(propValue, this.AUTO_LOADED_TEXT_SCHEME);
          item[prop] = this.isDocId(autoLoadedValue) ?
          await this.docsContent(itemKey, autoLoadedValue, docsStyle, cacheTime) :
          await this.textContent(itemKey, autoLoadedValue, cacheTime);
        }
      }
    }
    // return final item
    return item;
  }

  // Google Docs html content
  docsContent(
    itemKey: string,
    docId: string,
    docsStyle: DocsContentStyle = 'full',
    cacheTime = 1440,
  ) {
    return this.app.Cache.get<string>(
      'content_' + itemKey + '_' + docId + '_' + docsStyle,
      () => this.DatabaseDirect.docsContent(docId, docsStyle),
      cacheTime,
    );
  }

  // text-based content (txt, html, md, ...)
  textContent(itemKey: string, url: string, cacheTime = 1440) {
    return this.app.Cache.get<string>(
      'content_' + itemKey + '_' + md5(url),
      () => this.app.Fetch.get(url, {}, false),
      cacheTime,
    );
  }

  // json content
  jsonContent<Data>(itemKey: string, url: string, cacheTime = 1440) {
    return this.app.Cache.get<Data>(
      'content_' + itemKey + '_' + md5(url),
      () => this.app.Fetch.get(url),
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

  async clearCachedItem(sheet: string, itemKey: string) {
    await this.clearCachedAll(sheet); // clear database_<sheet>
    await this.app.Cache.removeByPrefix('content_' + itemKey); // clear content_<itemKey>
  }

  /**
   * convinient get
   */

  itemsOriginal<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !item['origin'] ||
        item['origin'] === item['$key']
      ),
      options,
    );
  }

  itemsDraft<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !item['status'] ||
        item['status'] === 'draft'
      ),
      options,
    );
  }

  itemsPublished<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['status'] &&
        item['status'] === 'published'
      ),
      options,
    );
  }

  itemsArchived<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
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
      (item: Item) => (
        !!item['type'] &&
        item['type'] === type
      ),
      options,
    );
  }

  itemsByTypeDefault<Item>(sheet: string, options: ItemsOptions = {}) {
    return this.items<Item>(
      sheet,
      (item: Item) => !item['type'],
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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
      (item: Item) => (
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