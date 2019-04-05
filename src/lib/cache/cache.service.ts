import { AppService } from '../app/app.service';
import { LocalstorageService } from '../localstorage/localstorage.service';
import {
  LocalstorageConfigs,
  LocalstorageIterateHandler,
  LocalstorageIterateKeysHandler,
} from '../localstorage/types';

import { CacheRefresher } from './types';

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
    // cacheTime = -1 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime = 0 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime # 0 -> cacheTime
    // globalCacheTime # 0 and cacheTime = 0 -> globalCacheTime
    // globalCacheTime # 0 and cacheTime # 0 -> cacheTime
    const { cacheTime: globalCacheTime } = this.app.options;
    return (cacheTime === -1) ? 0 : Math.abs(cacheTime || globalCacheTime || 0);
  }

  async set<Data>(key: string, data: Data, cacheTime?: number) {
    cacheTime = !!cacheTime ? cacheTime : 1; // default to 1 minute
    await this.Localstorage.set<number>(key + '__expiration', new Date().getTime() + (cacheTime * 60000));
    return await this.Localstorage.set<Data>(key, data);
  }

  async get<Data>(key: string, always = false) {
    let expired = true;
    const cachedData = await this.Localstorage.get<Data>(key);
    if (!!cachedData) {
      const cacheExpiration = await this.Localstorage.get<number>(key + '__expiration');
      if (!cacheExpiration || cacheExpiration > new Date().getTime()) {
        expired = false;
      }
    }
    if (always) {
      return { data: cachedData, expired };
    } else {
      return expired ? null : cachedData;
    }
  }

  async getRefresh<Data>(
    key: string,
    cacheTime?: number,
    refresher?: CacheRefresher<Data>,
  ) {
    let data: Data = null;
    cacheTime = this.cacheTime(cacheTime); // get app caching time
    if (cacheTime === 0) {
      data = await refresher(); // always fresh
    } else {
      // get cached
      const { data: cachedData, expired } = await this.get<Data>(key, true) as {
        data: Data; expired: boolean;
      };
      if (!expired) {
        data = cachedData;
      }
      // no cached or expired
      if (!data && !!refresher) {
        try {
          data = await refresher();
        } catch (error) {
          // error
        }
        if (!!data) {
          await this.set(key, data, cacheTime);
        } else {
          data = cachedData; // use expired value anyway
        }
      }
    }
    // return data
    return data;
  }

  async iterate<Data>(handler: LocalstorageIterateHandler<Data>) {
    return await this.Localstorage.iterate(handler);
  }

  async iterateKeys(handler: LocalstorageIterateKeysHandler) {
    return await this.Localstorage.iterateKeys(handler);
  }

  async remove(key: string) {
    await this.Localstorage.remove(key + '__expiration');
    return await this.Localstorage.remove(key);
  }

  async removeBulk(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      this.remove(keys[i]);
    }
  }

  async removeByPrefix(prefix: string) {
    return await this.Localstorage.removeByPrefix(prefix);
  }

  async removeBySuffix(suffix: string) {
    return await this.Localstorage.removeBySuffix(suffix);
  }

  async flush() {
    return await this.Localstorage.clear();
  }

  async flushExpired() {
    return await this.iterateKeys(async (key) => {
      if (key.indexOf('__expiration') > -1) {
        // retrieve expiration
        const cacheExpiration = await this.Localstorage.get(key);
        // remove if expired
        if (!!cacheExpiration && cacheExpiration <= new Date().getTime()) {
          await this.Localstorage.remove(key); // expiration
          await this.Localstorage.remove(key.replace('__expiration', '')); // value
        }
      }
    });
  }

}
