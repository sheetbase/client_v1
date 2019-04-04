import { createInstance } from 'localforage';

import { AppService } from '../app/app.service';

import { CacheRefresher } from './types';

export class CacheService {

  app: AppService;
  storage: LocalForage;

  constructor(app: AppService, storageConfigs?: LocalForageOptions) {
    this.app = app;
    this.storage = createInstance(!!storageConfigs ? storageConfigs : {
      name: 'sheetbasecache',
    });
  }

  instance(storageConfigs: LocalForageOptions) {
    return new CacheService(this.app, storageConfigs);
  }

  cacheTime(cacheTime: number) {
    // app cache time policy
    // cacheTime = -1 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime = 0 -> disable cache (0)
    // globalCacheTime = 0 and cacheTime # 0 -> cacheTime
    // globalCacheTime # 0 and cacheTime = 0 -> globalCacheTime
    // globalCacheTime # 0 and cacheTime # 0 -> cacheTime
    const { cacheTime: globalCacheTime } = this.app.options;
    return (cacheTime === -1) ? 0 : Math.abs(cacheTime || globalCacheTime || 0);
  }

  async set<Data>(key: string, data: Data, expiration?: number) {
    expiration = !!expiration ? expiration : 1; // default to 10 minutes
    await this.storage.setItem<number>(key + '_expiration', new Date().getTime() + (expiration * 60000));
    return await this.storage.setItem<Data>(key, data);
  }

  async get<Data>(key: string, always = false) {
    let expired = true;
    const cachedData = await this.storage.getItem<Data>(key);
    if (!!cachedData) {
      const cacheExpiration = await this.storage.getItem<number>(key + '_expiration');
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

  async getRefresh<Data>(key: string, expiration?: number, refresher?: CacheRefresher<Data>) {
    let data: Data = null;
    if (expiration === 0) {
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
          await this.set(key, data, expiration);
        } else {
          data = cachedData; // use expired value anyway
        }
      }
    }
    // return data
    return data;
  }

  async remove(key: string) {
    await this.storage.removeItem(key + '_expiration');
    return await this.storage.removeItem(key);
  }

  async flush() {
    return await this.storage.clear();
  }

  async flushExpired() {
    const keys = await this.storage.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.indexOf('_expiration') > -1) {
        // retrieve expiration
        const cacheExpiration = await this.storage.getItem(key);
        // remove if expired
        if (!!cacheExpiration && cacheExpiration <= new Date().getTime()) {
          await this.storage.removeItem(key); // expiration
          await this.storage.removeItem(key.replace('_expiration', '')); // value
        }
      }
    }
  }

}
