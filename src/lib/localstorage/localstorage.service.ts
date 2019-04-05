import { createInstance } from 'localforage';

import { AppService } from '../app/app.service';

import {
  LocalstorageConfigs,
  LocalstorageIterateHandler,
  LocalstorageIterateKeysHandler,
} from './types';

export class LocalstorageService {

  app: AppService;
  localforage: LocalForage;

  constructor(app: AppService, storageConfigs?: LocalstorageConfigs) {
    this.app = app;
    this.localforage = createInstance(!!storageConfigs ? storageConfigs : {
      name: 'SHEETBASE_STORAGE',
    });
  }

  instance(storageConfigs: LocalstorageConfigs) {
    return new LocalstorageService(this.app, storageConfigs);
  }

  async set<Data>(key: string, data: Data) {
    return await this.localforage.setItem(key, data);
  }

  async get<Data>(key: string) {
    return await this.localforage.getItem<Data>(key);
  }

  async iterate<Data>(handler: LocalstorageIterateHandler<Data>) {
    return await this.iterateKeys(async (key, i) => {
      const value = await this.get<Data>(key);
      await handler(value, key, i);
    });
  }

  async iterateKeys(handler: LocalstorageIterateKeysHandler) {
    const keys = await this.keys();
    for (let i = 0; i < keys.length; i++) {
      await handler(keys[i], i);
    }
  }

  async remove(key: string) {
    return await this.localforage.removeItem(key);
  }

  async removeBulk(keys: string[]) {
    for (let i = 0; i < keys.length; i++) {
      this.remove(keys[i]);
    }
  }

  async removeByPrefix(prefix: string) {
    return await this.iterateKeys(async (key) => {
      if (key.substr(0, prefix.length) === prefix) {
        await this.remove(key);
      }
    });
  }

  async removeBySuffix(suffix: string) {
    return await this.iterateKeys(async (key) => {
      if (key.substr(-suffix.length) === suffix) {
        await this.remove(key);
      }
    });
  }

  async clear() {
    return await this.localforage.clear();
  }

  async keys() {
    return await this.localforage.keys();
  }

}