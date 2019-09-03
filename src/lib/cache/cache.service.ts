import { AppService } from '../app/app.service';
import { LocalstorageService } from '../localstorage/localstorage.service';
import {
  LocalstorageConfigs,
  LocalstorageIterateHandler,
  LocalstorageIterateKeysHandler,
} from '../localstorage/types';

import { AlwaysCachedResult, CacheRefresher } from './types';

export class CacheService {

  private Localstorage: LocalstorageService;

  app: AppService;

  constructor(app: AppService, storageConfigs?: LocalstorageConfigs) {
    this.app = app;
    // localstorage
    this.Localstorage = this.app.Localstorage
      .instance(!!storageConfigs ? storageConfigs : {
        name: 'SHEETBASE_CACHE',
      });
  }

  instance(storageConfigs: LocalstorageConfigs) {
    return new CacheService(this.app, storageConfigs);
  }

  cacheTime(cacheTime: number) {
    // app caching time policy
    // cacheTime < 0 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime = 0 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime # 0 -> cacheTime
    // globalCacheTime # 0 and cacheTime = 0 -> globalCacheTime
    // globalCacheTime # 0 and cacheTime # 0 -> cacheTime
    const { cacheTime: globalCacheTime } = this.app.options;
    return (cacheTime < 0) ? 0 : (cacheTime || globalCacheTime || 0);
  }

  async set<Data>(key: string, data: Data, cacheTime = 0) {
    cacheTime = this.cacheTime(cacheTime); // get app caching time
    // expiration
    await this.Localstorage.set<number>(
      key + '__expiration',
      new Date().getTime() + (cacheTime * 60000),
    );
    // value
    return await this.Localstorage.set<Data>(key, data);
  }

  async get<Data>(key: string, alwaysData = false): Promise<
    Data | AlwaysCachedResult<Data>
  > {
    let expired = true; // assumpt expired
    const cachedData = await this.Localstorage.get<Data>(key);
    if (!!cachedData) {
      const cacheExpiration = await this.Localstorage.get<number>(key + '__expiration');
      if (!!cacheExpiration && cacheExpiration > new Date().getTime()) {
        expired = false;
      }
    }
    if (alwaysData) {
      return { data: cachedData, expired };
    } else {
      return expired ? null : cachedData;
    }
  }

  async getRefresh<Data>(
    key: string,
    refresher: CacheRefresher<Data>,
    cacheTime = 0,
  ) {
    // retrieve cached
    const { expired, data: cachedData } = await this.get<Data>(key, true) as AlwaysCachedResult<Data>;
    // get data
    let data: Data;
    if (!expired) { // no expired
      data = cachedData;
    } else { // expired or no cached
      try {
        data = await refresher();
      } catch (error) {
        // no refresher
        // or error while refreshing
      }
      data = !!data ?
        await this.set(key, data, cacheTime) : // set & use
        cachedData; // use expired value anyway
    }
    // return data
    return data;
  }

  iterate<Data>(handler: LocalstorageIterateHandler<Data>) {
    return this.Localstorage.iterate(handler);
  }

  iterateKeys(handler: LocalstorageIterateKeysHandler) {
    return this.Localstorage.iterateKeys(handler);
  }

  async remove(key: string) {
    await this.Localstorage.remove(key + '__expiration');
    return await this.Localstorage.remove(key);
  }

  async removeBulk(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      await this.remove(keys[i]);
    }
  }

  removeByPrefix(prefix: string) {
    return this.Localstorage.removeByPrefix(prefix);
  }

  removeBySuffix(suffix: string) {
    return this.Localstorage.removeBySuffix(suffix);
  }

  flush() {
    return this.Localstorage.clear();
  }

  flushExpired() {
    return this.Localstorage.iterateKeys(async (key) => {
      // loop through all expiration keys
      if (key.indexOf('__expiration') !== -1) {
        // retrieve expiration
        const cacheExpiration = await this.Localstorage.get(key);
        // remove if expired
        if (
          !cacheExpiration ||
          cacheExpiration <= new Date().getTime()
        ) {
          await this.Localstorage.remove(key); // expiration
          await this.Localstorage.remove(key.replace('__expiration', '')); // value
        }
      }
    });
  }

}
