import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';

import { Filter, AdvancedFilter, Query, DocsContentStyles, DataSegment } from './types';
import { DatabaseDirectService } from './direct';
import { DatabaseServerService } from './server';
import { buildQuery, buildAdvancedFilter, buildSegmentFilter } from './filter';

export class DatabaseService {

  private DatabaseDirect: DatabaseDirectService;
  private DatabaseServer: DatabaseServerService;

  private builtinPublicGids = {
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
  private globalSegment: DataSegment;

  app: AppService;

  constructor(app: AppService) {
    const { databaseId, databaseGids, databaseEndpoint } = app.options;
    // set app
    this.app = app;
    // create instances
    this.DatabaseDirect = new DatabaseDirectService(
      this.app,
      databaseId,
      {
        ... this.builtinPublicGids,
        ... databaseGids,
      },
    );
    this.DatabaseServer = new DatabaseServerService(
      this.app,
      databaseEndpoint,
    );
  }

  setSegmentation(globalSegment: DataSegment): DatabaseService {
    this.globalSegment = globalSegment;
    return this;
  }

  /**
   * utils
   */

  private isDirect(sheet: string) {
    const { databaseId, databaseGids = {} } = this.app.options;
    return (
      !!databaseId &&
      (
        !!this.builtinPublicGids[sheet] ||
        !!databaseGids[sheet]
      )
    );
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
    return !this.isDocUrl(contentSource) ? md5(contentSource) :
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
   * general get
   */

  async all<Item>(sheet: string, cacheTime = 1440) {
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

  async query<Item>(
    sheet: string,
    filter: Filter,
    useCached = true,
    cacheTime = 1440,
    // use this, else use global
    // bypass global: {} (empty object)
    segment: DataSegment = null,
  ): Promise<Item[]> {
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
        return await this.server().query(sheet, query, cacheTime, segment);
      } else {
        throw new Error('Can only apply advanced query with cached data.');
      }
    }
  }

  async items<Item>(
    sheet: string,
    filter?: Filter,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return !!filter ?
      this.query<Item>(sheet, filter, useCached, cacheTime, segment) :
      this.all<Item>(sheet, cacheTime);
  }

  async item<Item>(
    sheet: string,
    finder: string | Filter,
    useCached = true,
    cacheTime = 1440,
    docsStyle: DocsContentStyles = 'full',
    segment: DataSegment = null,
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
      const items: Item[] = await this.query(sheet, finder, useCached, cacheTime, segment);
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
    cacheTime = 1440,
    docsStyle: DocsContentStyles = 'full',
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
   * general set
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
      await this.app.Cache.removeByPrefix('content_' + this.contentId(contentSource));
    }
  }

  /**
   * convinient get
   */

  itemsOriginal<Item>(
    sheet: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !item['origin'] ||
        item['origin'] === item['$key']
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsDraft<Item>(
    sheet: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !item['status'] ||
        item['status'] === 'draft'
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsPublished<Item>(
    sheet: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['status'] &&
        item['status'] === 'published'
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsArchived<Item>(
    sheet: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['status'] &&
        item['status'] === 'archived'
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  async itemsByRelated<Item>(
    sheet: string,
    baseItem: Item,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    // retrieve category & tag
    const { categories, tags } = baseItem as any;
    const categoryKey = (!categories || typeof categories === 'string') ?
      null : Object.keys(categories).shift();
    const tagKey = (!tags || typeof tags === 'string') ?
      null : Object.keys(tags).shift();
    // get all items
    const items = await this.items<Item>(sheet, null, useCached, cacheTime, segment);
    // process items
    const matchedItems: Item[] = [];
    const unmatchedItems: Item[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // ignore the input item
      if (item['$key'] === baseItem['$key']) {
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
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['type'] &&
        item['type'] === type
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByTypeDefault<Item>(
    sheet: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => !item['type'],
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByAuthor<Item>(
    sheet: string,
    authorKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['authors'] &&
        !!item['authors'][authorKey]
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByLocale<Item>(
    sheet: string,
    locale: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['locale'] &&
        item['locale'] === locale
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByOrigin<Item>(
    sheet: string,
    origin: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['origin'] &&
        item['origin'] === origin
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByParent<Item>(
    sheet: string,
    parentKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['parents'] &&
        !!item['parents'][parentKey]
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByTerm<Item>(
    sheet: string,
    taxonomy: string,
    termKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item[taxonomy] &&
        !!item[taxonomy][termKey]
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByCategory<Item>(
    sheet: string,
    categoryKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.itemsByTerm<Item>(sheet, 'categories', categoryKey, useCached, cacheTime, segment);
  }

  itemsByTag<Item>(
    sheet: string,
    tagKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.itemsByTerm<Item>(sheet, 'tags', tagKey, useCached, cacheTime, segment);
  }

  itemsByKeyword<Item>(
    sheet: string,
    keyword: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['keywords'] &&
        item['keywords'].indexOf(keyword) > -1
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByMetaExists<Item>(
    sheet: string,
    metaKey: string,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['meta'] &&
        !!item['meta'][metaKey]
      ),
      useCached,
      cacheTime,
      segment,
    );
  }

  itemsByMetaEquals<Item>(
    sheet: string,
    metaKey: string,
    equalTo: any,
    useCached = true,
    cacheTime = 1440,
    segment: DataSegment = null,
  ) {
    return this.items<Item>(
      sheet,
      (item: Item) => (
        !!item['meta'] &&
        item['meta'][metaKey] === equalTo
      ),
      useCached,
      cacheTime,
      segment,
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