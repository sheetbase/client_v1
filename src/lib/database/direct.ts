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
      'SHEETBASE_DATA_' + sheet,
      this.getCacheTime(cacheTime),
      async () => {
        const response = await fetch(this.buildDataUrl(sheet));
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
    styles: DocsContentStyles = 'minimal',
    cacheTime = 0,
  ): Promise<{ content: string; }> {
    const content = await getCacheAndRefresh<string>(
      'SHEETBASE_CONTENT_' + url.replace('/pub', '').split('/').pop(),
      this.getCacheTime(cacheTime),
      async () => {
        const response = await fetch(url);
        return await this.parseContent(await response.text(), styles);
      },
    );
    return { content };
  }

  private buildDataUrl(sheet: string) {
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
        complete: (result) => resolve(result.data),
      });
    });
  }

  private parseContent(content: string, styles: DocsContentStyles = 'minimal') {
    content = content.match(/\<div id\=\"contents\"\>(.*)\<\/div\>\<div id\=\"footer\"\>/).pop();

    // clean style
    if (styles === 'clean') {
      // remove style tag
      content = content.replace(/\<style(.*?)\<\/style\>/g, '');
      // remove attrs
      const removeAttrs = ['style', 'id', 'class', 'width', 'height'];
      for (let i = 0, l = removeAttrs.length; i < l; i++) {
        content = content.replace(
          new RegExp('(\ ' + removeAttrs[i] + '\=\".*?\")', 'g'), '');
      }
    }
    // minimal (default)
    // full (not supported)

    // replace redirect links
    const links = content.match(/\"https\:\/\/www\.google\.com\/url\?q\=(.*?)\"/g);
    for (let i = 0, l = links.length; i < l; i++) {
      const link = links[i];
      const url = link.match(/\"https\:\/\/www\.google\.com\/url\?q\=(.*?)\&amp\;/).pop();
      content = content.replace(link, '"' + url + '"');
    }

    // final content
    return content;
  }

  private getCacheTime(cacheTime: number) {
    return (cacheTime === -1) ? 0 : Math.abs(cacheTime || this.app.options.cacheTime || 0);
  }
}