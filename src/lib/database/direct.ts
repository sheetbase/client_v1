import { parse } from 'papaparse';

import { AppService } from '../app/app.service';
import { parseObject } from '../utils';

import { DocsContentStyles } from './types';
import { getCacheAndRefresh } from './cache';

export class DatabaseDirectService {

  private app: AppService;

  constructor(app: AppService) {
    this.app = app;
  }

  async all<Item>(sheet: string, cacheTime = 0) {
    return await getCacheAndRefresh<Item[]>(
      'data_' + sheet,
      this.getCacheTime(cacheTime),
      async () => {
        const response = await fetch(this.csvUrl(sheet));
        const items = await this.parseCSV<Item>(await response.text());
        for (let i = 0, l = items.length; i < l; i++) {
          items[i]['_row'] = i + 2;
          parseObject(items[i]);
        }
        return items;
      },
    );
  }

  async content(
    url: string,
    styles: DocsContentStyles = 'clean',
    cacheTime = 0,
  ): Promise<{ content: string; }> {
    const content = await getCacheAndRefresh<string>(
      'content_' + url.replace('/pub', '').split('/').pop(),
      this.getCacheTime(cacheTime),
      async () => {
        const response = await fetch(url + '?embedded=true');
        return await this.parseContent(await response.text(), styles);
      },
    );
    return { content };
  }

  private csvUrl(sheet: string) {
    const { databasePublicId, databaseGids } = this.app.options;
    return `https://docs.google.com/spreadsheets/d/e/`
      + databasePublicId +
      `/pub?gid=`
      + databaseGids[sheet] +
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

  private getContentClassStyles(html: string) {
    // copy class to inline
    const classGroups = {};
    const classes = {};
    // extract classes
    const classStrs = html.match(/class\=\"(.*?)\"/g);
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

  private parseContent(html: string, styles: DocsContentStyles = 'clean') {
    let content = html; // original
    if (styles !== 'original') {

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
      for (let i = 0, l = links.length; i < l; i++) {
        const link = links[i];
        const url = link.match(/\"https\:\/\/www\.google\.com\/url\?q\=(.*?)\&amp\;/).pop();
        content = content.replace(link, '"' + url + '"');
      }

      // styles
      if (styles === 'full') { // full
        // move class styles to inline
        const classStyles = this.getContentClassStyles(html);
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

  private getCacheTime(cacheTime: number) {
    const { cacheTime: globalCacheTime } = this.app.options;
    return (cacheTime === -1) ? 0 : Math.abs(cacheTime || globalCacheTime || 0);
  }
}