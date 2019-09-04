import { parse } from 'papaparse';

import { md5 } from '../utils';
import { AppService } from '../app/app.service';

import { DocsContentStyle, DatabaseGids, DatabaseDataParser } from './types';

export class DatabaseDirectService {

  private PARSING_URL_SCHEME = 'url:';

  private databaseId: string;
  private databaseGids: DatabaseGids;
  private customDataParser: DatabaseDataParser;

  app: AppService;

  constructor(
    app: AppService,
    databaseId: string,
    databaseGids: DatabaseGids,
    customDataParser: DatabaseDataParser,
  ) {
    this.app = app;
    this.databaseId = databaseId;
    this.databaseGids = databaseGids;
    this.customDataParser = customDataParser;
  }

  getPublishedUrl(sheet: string, output = 'csv') {
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
        if ( // uc url builder
          typeof value === 'string' &&
          value.substr(0, this.PARSING_URL_SCHEME.length) === this.PARSING_URL_SCHEME
        ) {
          value = 'https://drive.google.com/uc?id=' + value.replace(this.PARSING_URL_SCHEME, '');
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

  /**
   * main
   *
   */

  all<Item>(sheet: string, cacheTime = 0) {
    return this.app.Cache.get<Item[]>(
      'database_' + sheet,
      async () => {
        const url = this.getPublishedUrl(sheet);
        const csvText: string = await this.app.Fetch.get(url, {}, { json: false });
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
      },
      cacheTime,
    );
  }

  // Google Docs html content
  docsContent(
    itemKey: string,
    docId: string,
    style: DocsContentStyle = 'full',
    cacheTime = 0,
  ) {
    const url = 'https://docs.google.com/document/d/' + docId + '/pub?embedded=true';
    return this.app.Cache.get<string>(
      'content_' + itemKey + '_' + docId + '_' + style,
      async () => this.processDocsContent(
        await this.app.Fetch.get(url, {}, { json: false }),
        style,
      ),
      cacheTime,
    );
  }

  // text-based content (txt, html, md, ...)
  textContent(itemKey: string, url: string, cacheTime = 0) {
    return this.app.Cache.get<string>(
      'content_' + itemKey + '_' + md5(url),
      () => this.app.Fetch.get(url, {}, { json: false }),
      cacheTime,
    );
  }

  // json content
  jsonContent<Data>(itemKey: string, url: string, cacheTime = 0) {
    return this.app.Cache.get<Data>(
      'content_' + itemKey + '_' + md5(url),
      () => this.app.Fetch.get(url) as Promise<Data>,
      cacheTime,
    );
  }

  /**
   * helpers
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