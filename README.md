# Sheetbase Client

JS client for Sheetbase app.

<!-- <block:header> -->

[![Build Status](https://travis-ci.com/sheetbase/client.svg?branch=master)](https://travis-ci.com/sheetbase/client) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/client/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/client?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/client.svg)](https://www.npmjs.com/package/@sheetbase/client) [![License][license_badge]][license_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

<!-- </block:header> -->

## Install

### NPM

`npm install --save @sheetbase/client@latest`

```ts
// full package, for dev
import { initializeApp } from '@sheetbase/client';

// only needed parts
import { initializeApp } from '@sheetbase/client/app';
// import '@sheetbase/client/database';
// import '@sheetbase/client/auth';
// import '@sheetbase/client/storage';
// import '@sheetbase/client/mail';
```

### CDN

Full package: <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase.min.js>

Only needed parts:

- App (required): <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase-app.min.js>
- Database (optional): <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase-database.min.js>
- Auth (optional): <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase-auth.min.js>
- Storage (optional): <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase-storage.min.js>
- Mail (optional): <https://unpkg.com/@sheetbase/client@latest/dist/sheetbase-mail.min.js>

## Usage

```ts

import { initializeApp } from '@sheetbase/client/app';

// init an app
const app = initializeApp({ /* configs */ });

// send a GET request
const result = await app.api().get('/');

// access imported parts
const database = app.database();
const auth = app.auth();
const storage = app.storage();
const mail = app.mail();

```

## Configs

Configs object for `initializeApp()`

```ts
{
  // api
  backendUrl: string; // backend url
  apiKey?: string; // built-in support for api key
  loggingEndpoint?: string; // custom logging endpoint

  // fetch

  // cache

  // localstorage

  // database
  databaseEndpoint?: string; // custom database endpoint
  databaseId?: string; // database for accessing directly
  databaseGids?: {} // gids map for accessing directly
  databaseUseCached?: boolean; // cache data
  databaseCacheTime?: number; // cache expiration
  databaseAutoContent?: boolean; // auto loaded content
  databaseDocsStyle?: DocsContentStyle; // Google Docs content style

  // auth
  authEndpoint?: string; // custom auth endpoint
  authProviders?: { // oauth cofigs
    [key in UserProviderId]?: OauthProvider;
  }

  // storage
  storageEndpoint?: string; // custom storage endpoint
  storageAllowTypes?: string[]; // type limit
  storageMaxSize?: number; // size limit

  // mail
  mailEndpoint?: string; // custom mail endpoint
}
```

## Fetch

### `app.fetch()`

```ts
class FetchService {
  app: AppService;
  fetch<Data>(input: RequestInfo, init?: RequestInit, json?: boolean): Promise<Data>;
  get<Data>(url: string, init?: RequestInit, json?: boolean, cacheTime?: number): Promise<Data>;
  post<Data>(url: string, init?: RequestInit): Promise<Data>;
  put<Data>(url: string, init?: RequestInit): Promise<Data>;
  patch<Data>(url: string, init?: RequestInit): Promise<Data>;
  delete<Data>(url: string, init?: RequestInit): Promise<Data>;
}
```

## Localstorage

### `app.localstorage()`

```ts
class LocalstorageService {
  app: AppService;
  localforage: LocalForage;
  instance(storageConfigs: LocalstorageConfigs): LocalstorageService;
  set<Data>(key: string, data: Data): Promise<Data>;
  get<Data>(key: string): Promise<Data>;
  iterate<Data>(handler: LocalstorageIterateHandler<Data>): Promise<any>;
  iterateKeys(handler: LocalstorageIterateKeysHandler): Promise<void>;
  remove(key: string): Promise<void>;
  removeBulk(keys: string[]): Promise<void>;
  removeByPrefix(prefix: string): Promise<void>;
  removeBySuffix(suffix: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}
```

## Cache

### `app.cache()`

```ts
class CacheService {
  app: AppService;
  instance(storageConfigs: LocalstorageConfigs): CacheService;
  set<Data>(key: string, data: Data, cacheTime?: number): Promise<Data>;
  get<Data>(key: string, refresher?: CacheRefresher<Data>, cacheTime?: number, keyBuilder?: (data: Data) => string): Promise<Data>;
  iterate<Data>(handler: LocalstorageIterateHandler<Data>): Promise<any>;
  iterateKeys(handler: LocalstorageIterateKeysHandler): Promise<void>;
  remove(key: string): Promise<void>;
  removeBulk(keys: string[]): Promise<void>;
  removeByPrefix(prefix: string): Promise<void>;
  removeBySuffix(suffix: string): Promise<void>;
  flush(): Promise<void>;
  flushExpired(): Promise<void>;
}
```

## API

### `app.api()`

```ts
class ApiService {
  app: AppService;
  extend(): ApiService;
  setData(data: ApiInstanceData): ApiService;
  setEndpoint(endpoint: string): ApiService;
  addQuery(query: RequestQuery): ApiService;
  addBody(body: RequestBody): ApiService;
  addBeforeHooks(hooks: BeforeRequestHook | BeforeRequestHook[]): ApiService;
  request<Data>(inputs?: {
    method?: string;
    endpoint?: string;
    query?: {};
    body?: {};
    cacheTime?: number;
  }): Promise<Data>;
  get<Data>(endpoint?: string, query?: {}, cacheTime?: number): Promise<Data>;
  post<Data>(endpoint?: string, query?: {}, body?: {}): Promise<Data>;
  put<Data>(endpoint?: string, query?: {}, body?: {}): Promise<Data>;
  patch<Data>(endpoint?: string, query?: {}, body?: {}): Promise<Data>;
  delete<Data>(endpoint?: string, query?: {}, body?: {}): Promise<Data>;
  system<Data>(): Promise<Data>;
  logging<Value>(value: Value, level?: LoggingLevel): Promise<any>;
  log<Value>(value: Value): Promise<any>;
  info<Value>(value: Value): Promise<any>;
  warn<Value>(value: Value): Promise<any>;
  error<Value>(value: Value): Promise<any>;
}
```

### `app.database()`

```ts
// DatabaseService
class DatabaseService {
  app: AppService;
  direct(): DatabaseDirectService;
  server(): DatabaseServerService;
  setSegmentation(globalSegment: DataSegment): DatabaseService;
  registerDataParser(parser: DataParser): DatabaseService;
  all<Item>(sheet: string, cacheTime?: number): Promise<Item[]>;
  query<Item>(sheet: string, filter: Filter<Item>, options?: ItemsOptions): Promise<Item[]>;
  items<Item>(sheet: string, filter?: Filter<Item>, options?: ItemsOptions): Promise<Item[]>;
  item<Item>(sheet: string, finder: string | number | Filter<Item>, options?: ItemOptions): Promise<Item>;
  docsContent(docId: string, docsStyle?: DocsContentStyle, cacheTime?: number): Promise<string>;
  textContent(url: string, cacheTime?: number): Promise<string>;
  jsonContent<Data>(url: string, cacheTime?: number): Promise<Data>;
  set<Data>(sheet: string, key: string, data: Data): Promise<any>;
  update<Data>(sheet: string, key: string, data: Data): Promise<any>;
  add<Data>(sheet: string, key: string, data: Data): Promise<any>;
  remove(sheet: string, key: string): Promise<any>;
  increase(sheet: string, key: string, increasing: string | string[] | {
    [path: string]: number;
  }): Promise<any>;
  clearCachedAll(input: string | string[]): void;
  clearCachedItem(sheet: string, key: string): Promise<void>;
  clearCachedContent(cachedInput: string): Promise<void>;
  itemsOriginal<Item>(sheet: string, options?: ItemsOptions): Promise<Item[]>;
  itemsDraft<Item>(sheet: string, options?: ItemsOptions): Promise<Item[]>;
  itemsPublished<Item>(sheet: string, options?: ItemsOptions): Promise<Item[]>;
  itemsArchived<Item>(sheet: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByRelated<Item>(sheet: string, baseItem: Item, options?: ItemsOptions): Promise<Item[]>;
  itemsByType<Item>(sheet: string, type: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByTypeDefault<Item>(sheet: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByAuthor<Item>(sheet: string, authorKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByLocale<Item>(sheet: string, locale: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByOrigin<Item>(sheet: string, origin: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByParent<Item>(sheet: string, parentKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByTerm<Item>(sheet: string, taxonomy: string, termKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByCategory<Item>(sheet: string, categoryKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByTag<Item>(sheet: string, tagKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByKeyword<Item>(sheet: string, keyword: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByMetaExists<Item>(sheet: string, metaKey: string, options?: ItemsOptions): Promise<Item[]>;
  itemsByMetaEquals<Item>(sheet: string, metaKey: string, equalTo: any, options?: ItemsOptions): Promise<Item[]>;
  viewing(sheet: string, key: string): Promise<any>;
  liking(sheet: string, key: string): Promise<any>;
  commenting(sheet: string, key: string): Promise<any>;
  rating(sheet: string, key: string, stars: number): Promise<any>;
  sharing(sheet: string, key: string, providers?: string[]): Promise<any>;
}

// DatabaseDirectService
class DatabaseDirectService {
  app: AppService;
  registerDataParser(parser: DataParser): DatabaseDirectService;
  all<Item>(sheet: string): Promise<Item[]>;
  docsContent(docId: string, style?: DocsContentStyle): Promise<string>;
  textContent(url: string): Promise<string>;
  jsonContent<Data>(url: string): Promise<Data>;
  hasAccess(sheet: string): boolean;
  isUrl(value: string): boolean;
  isFileId(value: string): boolean;
  isDocId(value: string): boolean;
  buildFileUrl(id: string): string;
  buildAutoLoadedValue(rawValue: string, scheme: string): string;
  buildPublishedUrl(sheet: string, output?: string): string;
  parseCSV<Item>(csv: string): Promise<Item[]>;
  parseData<Item>(item: Item): Item;
  processDocsContent(html: string, style?: DocsContentStyle): string;
  fulfillItemContent<Item>(item: Item, docsStyle?: DocsContentStyle): Promise<Item>;
}

// DatabaseServerService
class DatabaseServerService {
  app: AppService;
  all<Item>(sheet: string): Promise<Item[]>;
  query<Item>(sheet: string, query: Query, segment?: DataSegment): Promise<Item[]>;
  item<Item>(sheet: string, key: string): Promise<Item>;
  docsContent(docId: string, style?: DocsContentStyle): Promise<string>;
  set<Data>(sheet: string, key: string, data: Data): Promise<any>;
  update<Data>(sheet: string, key: string, data: Data): Promise<any>;
  add<Data>(sheet: string, key: string, data: Data): Promise<any>;
  remove(sheet: string, key: string): Promise<any>;
  increase(sheet: string, key: string, increasing: string | string[] | {
    [path: string]: number;
  }): Promise<any>;
}
```

### `app.auth()`

```ts
// AuthService
class AuthService {
  app: AppService;
  currentUser: User;
  onAuthStateChanged(next: {
    (user: User): any;
  }): void;
  checkActionCode(code: string): Promise<any>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<{
    user: User;
  }>;
  signInWithEmailAndPassword(email: string, password: string): Promise<{
    user: User;
  }>;
  signInWithCustomToken(token: string): Promise<{
    user: User;
  }>;
  signInAnonymously(): Promise<{
    user: User;
  }>;
  sendPasswordResetEmail(email: string): Promise<any>;
  verifyPasswordResetCode(code: string): Promise<any>;
  confirmPasswordReset(code: string, newPassword: string): Promise<any>;
  signInWithPopup(provider: AuthProvider): Promise<void>;
  googleAuthProvider(): AuthProvider;
  facebookAuthProvider(): AuthProvider;
  signOut(): Promise<void>;
}

// User
class User {
  idToken: string;
  refreshToken: string;
  uid: string;
  providerId: string;
  email: string;
  emailVerified: boolean;
  type: string;
  createdAt: string;
  lastLogin: string;
  username: string;
  phoneNumber: number | string;
  displayName: string;
  photoURL: string;
  bio: string;
  url: string;
  addresses: string | {
    [name: string]: any;
  };
  additionalData: {
    [key: string]: any;
  };
  claims: {
    [claim: string]: any;
  };
  settings: UserProfileSettings;
  isAnonymous: boolean;
  isNewUser: boolean;
  toJSON(): {
    uid: string;
    providerId: string;
    email: string;
    emailVerified: boolean;
    type: string;
    createdAt: string;
    lastLogin: string;
    username: string;
    phoneNumber: string | number;
    displayName: string;
    photoURL: string;
    bio: string;
    url: string;
    addresses: string | {
      [name: string]: any;
    };
    additionalData: {
      [key: string]: any;
    };
    claims: {
      [claim: string]: any;
    };
    settings: UserProfileSettings;
    isAnonymous: boolean;
    isNewUser: boolean;
  };
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<any>;
  sendEmailVerification(): Promise<any>;
  updateProfile(profile: UserEditableProfile): Promise<UserInfo>;
  setAdditionalData(data: {
    [key: string]: any;
  }): Promise<UserInfo>;
  setSettings(data: {
    [key: string]: any;
  }): Promise<UserInfo>;
  setProfilePublicly(props: string | string[]): Promise<UserInfo>;
  setProfilePrivately(props: string | string[]): Promise<UserInfo>;
  setUsername(username: string): Promise<UserInfo>;
  changePassword(currentPassword: string, newPassword: string): Promise<any>;
  logout(): Promise<any>;
  delete(): Promise<any>;
}
```

### `app.storage()`

```ts
class StorageService {
  app: AppService;
  info(id: string, cacheTime?: number): Promise<FileInfo>;
  upload(fileData: UploadFile, customFolder?: string, renamePolicy?: RenamePolicy, sharing?: FileSharing): Promise<FileInfo>;
  uploadMultiple(uploadResources: UploadResource[]): Promise<FileInfo[]>;
  update(id: string, data: FileUpdateData): Promise<{
    done: true;
  }>;
  remove(id: string): Promise<{
    done: true;
  }>;
  read(_file: File): Promise<FileReaderResult>;
}
```

### `app.mail()`

```ts
class MailService {
  app: AppService;
  quota(): Promise<MailingQuota>;
  threads(category?: string): Promise<MailingThread[]>;
  send(mailingData: MailingData, category?: string, template?: any, silent?: any): Promise<MailSentResult>;
}
```

## Lisence

Sheetbase Client is released under the [MIT](https://github.com/sheetbase/client/blob/master/LICENSE) license.

<!-- <block:footer> -->

[license_badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license_url]: https://github.com/sheetbase/client/blob/master/LICENSE
[patreon_badge]: https://lamnhan.github.io/assets/images/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan
[paypal_donate_badge]: https://lamnhan.github.io/assets/images/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan
[ask_me_badge]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </block:footer> -->