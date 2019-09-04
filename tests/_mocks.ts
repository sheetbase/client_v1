import { Options } from '../src/index';

export class MockedAppService {
  options = {};
  Api = new MockedApiService();
  Localstorage = new MockedLocalstorageService();
  Cache = new MockedCacheService();
  constructor(options?: Options) { this.options = options || {}; }
}

export class MockedApiService {
  baseEndpoint: string;
  constructor() {}
  extend() { return new MockedApiService(); }
  setEndpoint(endpoint) { this.baseEndpoint = endpoint; return this; }
  addBeforeHooks() { return this; }
  async get(...args) { return { method: 'GET', args }; }
  async post(...args) { return { method: 'POST', args }; }
  async put(...args) { return { method: 'PUT', args }; }
  async patch(...args) { return { method: 'PATCH', args }; }
  async delete(...args) { return { method: 'DELETE', args }; }
}

export class MockedLocalstorageService {
  constructor() {}
  instance() { return new MockedLocalstorageService(); }
  async get(...args) { return args; }
  async set(...args) { return args; }
  async iterate(handler) { return handler; }
  async iterateKeys(handler) { return handler; }
  async remove(...args) { return args; }
  async removeByPrefix(...args) { return args; }
  async removeBySuffix(...args) { return args; }
  async clear() { return '#clear'; }
}

export class MockedCacheService {
  constructor() {}
  async get(...args) { return args; }
}
