# Sheetbase Client

JS client for Sheetbase app.

<!-- <block:header> -->

[![Build Status](https://travis-ci.com/sheetbase/client.svg?branch=master)](https://travis-ci.com/sheetbase/client) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/client/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/client?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/client.svg)](https://www.npmjs.com/package/@sheetbase/client) [![License][license_badge]][license_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

<!-- </block:header> -->

## Install

`npm install @sheetbase/client`

## Usage

```ts

import { initializeApp } from '@sheetbase/client';

// init an app
const app = initializeApp({ /* configs */ });

// send a GET request
const result = await app.api().get('/');

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