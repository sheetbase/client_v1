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

  // fetch

  // cache
  cacheTime?: number; // global cache time

  // localstorage

  // database
  databaseEndpoint?: string; // custom database endpoint
  databaseId?: string; // database for public accessing
  databaseGids?: {} // gids map for public accessing

  // auth
  authEndpoint?: string; // custom auth endpoint

  // storage
  storageEndpoint?: string; // custom storage endpoint
  storageAllowTypes?: string[]; // type limit
  storageMaxSize?: number; // size limit

  // mail
  mailEndpoint?: string; // custom mail endpoint
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
  addQuery(query: {}): ApiService;
  addBody(body: {}): ApiService;
  addBeforeHooks(hooks: BeforeRequestHook | BeforeRequestHook[]): ApiService;
  request(inputs?: {
    method?: string;
    endpoint?: string;
    query?: {};
    body?: {};
    cacheTime?: number;
  }): Promise<any>;
  get(endpoint?: string, query?: {}, cacheTime?: number): Promise<any>;
  post(endpoint?: string, query?: {}, body?: {}): Promise<any>;
  put(endpoint?: string, query?: {}, body?: {}): Promise<any>;
  patch(endpoint?: string, query?: {}, body?: {}): Promise<any>;
  delete(endpoint?: string, query?: {}, body?: {}): Promise<any>;
}
```

## Fetch

### `app.fetch()`

```ts
class FetchService {
  app: AppService;
  fetch<Data>(input: RequestInfo, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
  get<Data>(url: string, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
  post<Data>(url: string, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
  put<Data>(url: string, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
  patch<Data>(url: string, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
  delete<Data>(url: string, init?: RequestInit, meta?: FetchMeta): Promise<string | Data>;
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
  cacheTime(cacheTime: number): number;
  set<Data>(key: string, data: Data, cacheTime?: number): Promise<Data>;
  get<Data>(key: string, always?: boolean): Promise<Data | {
    data: Data;
    expired: boolean;
  }>;
  getRefresh<Data>(key: string, cacheTime?: number, refresher?: CacheRefresher<Data>): Promise<Data>;
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

### `app.database()`

```ts
// DatabaseService
class DatabaseService {
  app: AppService;
  setSegmentation(globalSegment: DataSegment): DatabaseService;
  direct(): DatabaseDirectService;
  server(): DatabaseServerService;
  all<Item>(sheet: string, cacheTime?: number): Promise<Item[]>;
  query<Item>(sheet: string, filter: Filter, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  items<Item>(sheet: string, filter?: Filter, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  item<Item>(sheet: string, finder: string | Filter, useCached?: boolean, cacheTime?: number, docsStyle?: DocsContentStyles, segment?: DataSegment): Promise<Item>;
  content(url: string, cacheTime?: number, docsStyle?: DocsContentStyles): Promise<string>;
  set<Data>(sheet: string, key: string, data: Data): Promise<any>;
  update<Data>(sheet: string, key: string, data: Data): Promise<any>;
  add<Data>(sheet: string, key: string, data: Data): Promise<any>;
  remove(sheet: string, key: string): Promise<any>;
  increase(sheet: string, key: string, increasing: string | string[] | {
    [path: string]: number;
  }): Promise<any>;
  clearCachedAll(input: string | string[]): Promise<void>;
  clearCachedItem<Item>(sheet: string, item: Item): Promise<void>;
  itemsOriginal<Item>(sheet: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsDraft<Item>(sheet: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsPublished<Item>(sheet: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsArchived<Item>(sheet: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByRelated<Item>(sheet: string, baseItem: Item, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByType<Item>(sheet: string, type: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByTypeDefault<Item>(sheet: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByAuthor<Item>(sheet: string, authorKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByLocale<Item>(sheet: string, locale: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByOrigin<Item>(sheet: string, origin: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByParent<Item>(sheet: string, parentKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByTerm<Item>(sheet: string, taxonomy: string, termKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByCategory<Item>(sheet: string, categoryKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByTag<Item>(sheet: string, tagKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByKeyword<Item>(sheet: string, keyword: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByMetaExists<Item>(sheet: string, metaKey: string, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  itemsByMetaEquals<Item>(sheet: string, metaKey: string, equalTo: any, useCached?: boolean, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  viewing(sheet: string, key: string): Promise<any>;
  liking(sheet: string, key: string): Promise<any>;
  commenting(sheet: string, key: string): Promise<any>;
  rating(sheet: string, key: string, stars: number): Promise<any>;
  sharing(sheet: string, key: string, providers?: string[]): Promise<any>;
}

// DatabaseDirectService
class DatabaseDirectService {
  app: AppService;
  all<Item>(sheet: string, cacheTime?: number): Promise<Item[]>;
  docsContent(docUrl: string, style?: DocsContentStyles, cacheTime?: number): Promise<{
    docId?: string;
    content: string;
  }>;
}

// DatabaseServerService
class DatabaseServerService {
  app: AppService;
  all<Item>(sheet: string, cacheTime?: number): Promise<Item[]>;
  query<Item>(sheet: string, query: Query, cacheTime?: number, segment?: DataSegment): Promise<Item[]>;
  item<Item>(sheet: string, key: string, cacheTime?: number): Promise<Item>;
  docsContent(docUrl: string, style?: DocsContentStyles, cacheTime?: number): Promise<{
    docId?: string;
    content: string;
  }>;
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
  info(id: string): Promise<FileInfo>;
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
  quota(): Promise<any>;
  send(mailingData: MailingData, category?: string, template?: any, silent?: any): Promise<any>;
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