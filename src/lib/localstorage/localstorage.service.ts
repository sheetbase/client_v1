import { createInstance } from 'localforage';

import { AppService } from '../app/app.service';

import { LocalstorageConfigs } from './types';

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

  async remove(key: string) {
    return await this.localforage.removeItem(key);
  }

  async clear() {
    return await this.localforage.clear();
  }

  async keys() {
    return await this.localforage.keys();
  }

}