import { parse } from 'papaparse';
import { md5 } from '../../md5/md5';

import { AppService } from '../app/app.service';
import { parseObject } from '../utils';

import { DocsContentStyles } from './types';

export class DatabaseDirectService {

  private databaseId: string;
  private databaseGids: {[sheet: string]: string};

  app: AppService;

  constructor(
    app: AppService,
    databaseId: string,
    databaseGids: {[sheet: string]: string},
  ) {
    this.app = app;
    this.databaseId = databaseId;
    this.databaseGids = databaseGids;
  }

  async all<Item>(sheet: string, cacheTime = 0) {
    return await this.app.Cache.getRefresh<Item[]>(
      'database_' + sheet,
      cacheTime,
      async () => {
        // fetch csv file
        const csvText: string = await this.app.Fetch.get(
          this.csvUrl(sheet), {}, { json: false },
        );
        // parse
        const items = await this.parseCSV<Item>(csvText);
        // process items
        for (let i = 0, l = items.length; i < l; i++) {
          items[i]['_row'] = i + 2;
          parseObject(items[i]);
        }
        return items;
      },
    );
  }

  // Google Docs html content
  docsContent(
    itemKey: string,
    docId: string,
    style: DocsContentStyles = 'full',
    cacheTime = 0,
  ) {
    const url = 'https://docs.google.com/document/d/' + docId + '/pub?embedded=true';
    return this.app.Cache.getRefresh<string>(
      'content_' + itemKey + '_' + docId + '_' + style,
      cacheTime,
      async () => this.parseDocsContent(
        await this.app.Fetch.get(url, {}, { json: false }),
        style,
      ),
    );
  }

  // text-based content (txt, html, md, ...)
  textContent(itemKey: string, url: string, cacheTime = 0) {
    return this.app.Cache.getRefresh<string>(
      'content_' + itemKey + '_' + md5(url),
      cacheTime,
      async () => await this.app.Fetch.get(url, {}, { json: false }),
    );
  }

  // json content
  jsonContent<Data>(itemKey: string, url: string, cacheTime = 0) {
    return this.app.Cache.getRefresh<Data>(
      'content_' + itemKey + '_' + md5(url),
      cacheTime,
      async () => await this.app.Fetch.get(url) as Data,
    );
  }

  private csvUrl(sheet: string) {
    return `https://docs.google.com/spreadsheets/d/`
      + this.databaseId +
      `/pub?gid=`
      + this.databaseGids[sheet] +
      `&single=true&output=csv`;
  }

  private parseCSV<Item>(csv: string) {
    return new Promise<Item[]>((resolve, reject) => {
      parse(csv, {
        header: true,
        complete: (result) => !result.errors.length ? resolve(result.data) : reject(result.errors),
      });
    });
  }

  private getClassStyles(html: string) {
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

  private parseDocsContent(html: string, style: DocsContentStyles = 'full') {
    let content = html; // original
    if (style !== 'original') {

      // extract content, between: </head></html>
      content = html.match(/\<\/head\>(.*)\<\/html\>/).pop();

      // clean up
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

      // styles
      if (style === 'full') { // full
        // move class styles to inline
        const classStyles = this.getClassStyles(html);
        for(const key of Object.keys(classStyles)) {
          content = content.replace(
            new RegExp('class="' + key + '"', 'g'),
            'style="' + classStyles[key] + '"',
          );
        }
        // TODO: move tag styles to inline
      } else { //clean

        // remove all attributes
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

}