export class MockedAppService {

  options = {};
  Api = new MockedApiService();
  Cache = new MockedCacheService();

  constructor() {}

}

export class MockedApiService {

  baseEndpoint: string;

  constructor() {}

  extend() {
    return new MockedApiService();
  }

  setEndpoint(endpoint) {
    this.baseEndpoint = endpoint;
    return this;
  }

  async get(...args) {
    return { method: 'GET', args };
  }

  async post(...args) {
    return { method: 'POST', args };
  }

}

export class MockedCacheService {

  constructor() {}

  async getRefresh(...args) {
    return args;
  }

}
