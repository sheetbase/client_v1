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

  async set<Data>(key: string, data: Data, cacheTime = 0) {
    cacheTime = Math.abs(cacheTime);
    if (cacheTime === 0) {
      throw new Error('Not caching when time is 0. Set time globally or use the argument.');
    }
    // save expiration
    await this.Localstorage.set<number>(
      key + '__expiration',
      new Date().getTime() + (cacheTime * 60000),
    );
    // return value
    return this.Localstorage.set<Data>(key, data);
  }

  async get<Data>(
    key: string,
    refresher?: CacheRefresher<Data>,
    cacheTime = 0,
  ) {
    // retrieve cached
    const expiration = await this.Localstorage.get<number>(key + '__expiration');
    const isExpired = (!expiration || expiration <= new Date().getTime());
    // not expired
    if (!isExpired) {
      return this.Localstorage.get<Data>(key);
    }
    // expired or no cached
    try {
      const freshData = await refresher(); // refresh
      // return value if cache time = 0
      // else save cache then return value
      return (cacheTime === 0) ? freshData : this.set(key, freshData, cacheTime);
    } catch (error) {
      // no refresher or error while refreshing
      // use cached any value or null
      return !!refresher ? this.Localstorage.get<Data>(key) : null;
    }
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
