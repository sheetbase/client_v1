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