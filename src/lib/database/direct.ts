import { parse } from 'papaparse';

import { AppService } from '../app/app.service';

import { DocsContentStyle, DatabaseGids, DataParser } from './types';

export class DatabaseDirectService {

  private BUILTIN_PUBLIC_GIDS = {
    categories: '101',
    tags: '102',
    pages: '103',
    posts: '104',
    authors: '105',
    threads: '106',
    options: '108',
    bundles: '111',
    audios: '112',
    videos: '113',
    products: '114',
    notifications: '181',
    promotions: '182',
  };
  private AUTO_LOADED_JSON_SCHEME = 'json://';
  private AUTO_LOADED_TEXT_SCHEME = 'content://';

  private databaseId: string;
  private databaseGids: DatabaseGids;
  private customDataParser: DataParser;

  app: AppService;

  constructor(app: AppService) {
    // app
    this.app = app;
    // props
    this.databaseId = this.app.options.databaseId;
    this.databaseGids = {
      ... this.BUILTIN_PUBLIC_GIDS,
      ... this.app.options.databaseGids,
    };
  }

  registerDataParser(parser: DataParser): DatabaseDirectService {
    this.customDataParser = parser;
    return this;
  }

  /**
   * main
   *
   */

  async all<Item>(sheet: string) {
    const url = this.buildPublishedUrl(sheet);
    const csvText = await this.app.Fetch.get<string>(url, {}, false);
    const rawItems = await this.parseCSV<Item>(csvText);
    // process raw items
    const items: Item[] = [];
    for (let i = 0, l = rawItems.length; i < l; i++) {
      const item = this.parseData(rawItems[i]);
      // save item to the result if not empty
      if (!!Object.keys(item).length) {
        item['_row'] = i + 2;
        items.push(item);
      }
    }
    // final result
    return items;
  }

  // Google Docs html content
  async docsContent(
    docId: string,
    style: DocsContentStyle = 'full',
  ) {
    const url = 'https://docs.google.com/document/d/' + docId + '/pub?embedded=true';
    const content = await this.app.Fetch.get<string>(url, {}, false);
    return this.processDocsContent(content, style);
  }

  // text-based content (txt, html, md, ...)
  textContent(url: string) {
    return this.app.Fetch.get<string>(url, {}, false);
  }

  // json content
  jsonContent<Data>(url: string) {
    return this.app.Fetch.get<Data>(url);
  }

  /**
   * helpers
   *
   */

  // is this sheet available for direct access
  hasAccess(sheet: string) {
    return (!!this.databaseId && !!this.databaseGids[sheet]);
  }

  isUrl(value: string) {
    return (
      !!value &&
      typeof value === 'string' &&
      (
        value.substr(0, 7) === 'http://' ||
        value.substr(0, 8) === 'https://'
      )
    );
  }

  isFileId(value: string) {
    // example: 17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W
    // usually an 33 characters id, and starts with 1
    return (
      !!value &&
      typeof value === 'string' &&
      value.substr(0, 1) === '1' &&
      value.length > 31 &&
      value.length < 35
    );
  }

  isDocId(value: string) {
    // example: 1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc
    // usually an 44 characters id, and starts with 1
    return (
      !!value &&
      typeof value === 'string' &&
      value.substr(0, 1) === '1' &&
      value.length > 42 &&
      value.length < 46
    );
  }

  buildFileUrl(id: string) {
    return 'https://drive.google.com/uc?id=' + id;
  }

  // return url to resource or a doc id
  buildAutoLoadedValue(rawValue: string, scheme: string) {
    let value = rawValue.replace(scheme, '');
    if (!this.isUrl(value) && this.isFileId(value)) {
      value = this.buildFileUrl(value);
    }
    return value;
  }

  buildPublishedUrl(sheet: string, output = 'csv') {
    return 'https://docs.google.com/spreadsheets/d/' + this.databaseId + '/pub' +
      '?gid=' + this.databaseGids[sheet] +
      '&output=' + output +
      '&single=true';
  }

  parseCSV<Item>(csv: string) {
    return new Promise<Item[]>((resolve, reject) => {
      parse(csv, {
        header: true,
        complete: result => !result.errors.length ? resolve(result.data) : reject(result.errors),
      });
    });
  }

  parseData<Item>(item: Item) {
    for (const key of Object.keys(item)) {
      let value = item[key];
      // remove empty values
      if (
        value === '' ||
        value === undefined ||
        value === null
      ) {
        delete item[key];
      } else {
        // 1. BASIC
        if ((value + '').toLowerCase() === 'true') { // TRUE
          value = true;
        } else if ((value + '').toLowerCase() === 'false') { // FALSE
          value = false;
        } else if (!isNaN(value)) { // number
          value = Number(value);
        } else { // JSON
          try {
            value = JSON.parse(value);
          } catch (e) {
            /* invalid json, keep value as is */
          }
        }
        // 2. BUILTIN
        // uc url builder
        if (this.isFileId(value)) {
          value = this.buildFileUrl(value);
        }
        // 3. CUSTOM
        if (
          !!this.customDataParser &&
          this.customDataParser instanceof Function
        ) {
          value = this.customDataParser(value);
        }
        // FINALLY (overwrite the value)
        item[key] = value;
      }
    }
    return item;
  }

  processDocsContent(html: string, style: DocsContentStyle = 'full') {
    let content = html; // original
    // not original
    if (style !== 'original') {
      // extract content, between: </head></html>
      const contentMatch = html.match(/\<\/head\>(.*)\<\/html\>/);
      content = !!contentMatch ? contentMatch.pop() : content;
      // remove useless tags
      content = content
        .replace(/\<body(.*?)\>/, '') // replace: <body...>
        .replace('</body>', '') // replace </body>
        .replace(/\<script(.*?)\<\/script\>/g, '') // remove all script tag
        .replace(/\<style(.*?)\<\/style\>/g, ''); // remove all style tag
      // replace redirect links
      const links = content.match(/\"https\:\/\/www\.google\.com\/url\?q\=(.*?)\"/g);
      if (!!links) {
        for (let i = 0, l = links.length; i < l; i++) {
          const link = links[i];
          const urlMatch = link.match(/\"https\:\/\/www\.google\.com\/url\?q\=(.*?)\&amp\;/);
          if (!!urlMatch) {
            const url = urlMatch.pop();
            content = content.replace(link, '"' + url + '"');
          }
        }
      }
      // specific: full
      if (style === 'full') {
        // move class styles to inline
        const classStyles = this.getCSSByClasses(html);
        for(const key of Object.keys(classStyles)) {
          content = content.replace(
            new RegExp('class="' + key + '"', 'g'),
            'style="' + classStyles[key] + '"',
          );
        }
        // TODO: move tag styles to inline
      }
      // specific: clean
      else if (style === 'clean') {
        // remove attributes
        const removeAttrs = ['style', 'id', 'class', 'width', 'height'];
        for (let i = 0, l = removeAttrs.length; i < l; i++) {
          content = content.replace(
            new RegExp('\ ' + removeAttrs[i] + '\=\"(.*?)\"', 'g'),
            '',
          );
        }
      }
    }
    return content;
  }

  async loadItemContent<Item>(item: Item, docsStyle: DocsContentStyle = 'full') {
    // check all props and load values
    for (const prop of Object.keys(item)) {
      const propValue = item[prop];
      // auto-loaded json://
      if (
        typeof propValue === 'string' &&
        propValue.substr(0, this.AUTO_LOADED_JSON_SCHEME.length) === this.AUTO_LOADED_JSON_SCHEME
      ) {
        // load and overwrite the data
        const autoLoadedValue = this.buildAutoLoadedValue(propValue, this.AUTO_LOADED_JSON_SCHEME);
        item[prop] = await this.jsonContent(autoLoadedValue);
      }
      // auto-loaded content://
      if (
        typeof propValue === 'string' &&
        propValue.substr(0, this.AUTO_LOADED_TEXT_SCHEME.length) === this.AUTO_LOADED_TEXT_SCHEME
      ) {
        const autoLoadedValue = this.buildAutoLoadedValue(propValue, this.AUTO_LOADED_TEXT_SCHEME);
        item[prop] = this.isDocId(autoLoadedValue) ?
        await this.docsContent(autoLoadedValue, docsStyle) :
        await this.textContent(autoLoadedValue);
      }
    }
    return item;
  }

  /**
   * misc
   *
   */

  private getCSSByClasses(html: string) {
    // copy class to inline
    const classGroups = {};
    const classes = {};
    // extract classes
    const classStrs = html.match(/class\=\"(.*?)\"/g);
    if (!!classStrs) {
      for (let i = 0, l = classStrs.length; i < l; i++) {
        const classStr = classStrs[i].match(/class\=\"(.*?)\"/);
        if (!!classStr) {
          const classNamesStr = classStr.pop();
          // add to classGroups
          if (classNamesStr.indexOf(' ') > -1) {
            classGroups[classNamesStr] = '';
          }
          // add to classes
          const classNames = classNamesStr.split(' ').filter(Boolean);
          for (let j = 0, lj = classNames.length; j < lj; j++) {
            classes[classNames[j]] = '';
          }
        }
      }
    }
    // get class styles
    for (const className of Object.keys(classes)) {
      const stylesMatch = html.match(new RegExp('.' + className + '{(.*?)}'));
      // extract styles
      if (!!stylesMatch) {
        classes[className] = stylesMatch.pop().replace(/\"/g, '\'') + ';';
      }
    }
    // get group styles
    for (const classGroup of Object.keys(classGroups)) {
      let groupStyles = '';
      const classNames = classGroup.split(' ').filter(Boolean);
      for (let i = 0, l = classNames.length; i < l; i++) {
        groupStyles = groupStyles + classes[classNames[i]];
      }
      // save styles to group
      classGroups[classGroup] = groupStyles;
    }
    return { ... classGroups, ... classes };
  }

}