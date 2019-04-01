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
      'DATA_' + sheet,
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
    styles: DocsContentStyles = 'minimal',
    cacheTime = 0,
  ): Promise<{ content: string; }> {
    const content = await getCacheAndRefresh<string>(
      'CONTENT_' + url.replace('/pub', '').split('/').pop(),
      this.getCacheTime(cacheTime),
      async () => {
        const response = await fetch(url);
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

  private parseContent(content: string, styles: DocsContentStyles = 'minimal') {
    content = content.match(/\<div id\=\"contents\"\>(.*)\<\/div\>\<div id\=\"footer\"\>/).pop();

    // clean style
    if (styles === 'clean') {
      // remove style tag
      content = content.replace(/\<style(.*?)\<\/style\>/g, '');
      // remove attrs
      const removeAttrs = ['style', 'id', 'class', 'width', 'height'];
      for (let i = 0, l = removeAttrs.length; i < l; i++) {
        content = content.replace(new RegExp('(\ ' + removeAttrs[i] + '\=\".*?\")', 'g'), '');
      }
    } else if (styles === 'minimal') { // minimal
      // copy class to inline
      const classGroups = {};
      const classes = {};
      // extract classes
      const classStrs = content.match(/class\=\"(.*?)\"/g);
      for (let i = 0, l = classStrs.length; i < l; i++) {
        const classStr = classStrs[i].match(/class\=\"(.*?)\"/);
        if (!!classStr) {
          const classNamesStr = classStr.pop();
          if (classNamesStr.indexOf(' ') > -1) {
            classGroups[classNamesStr] = '';
          }
          const classNames = classNamesStr.split(' ');
          for (let j = 0, lj = classNames.length; j < lj; j++) {
            classes[classNames[j]] = '';
          }
        }
      }
      // get styles
      for (const className of Object.keys(classes)) {
        const styles = content.match(new RegExp('.' + className + '{(.*?)}')).pop(); // extract styles
        classes[className] = styles.replace(/\"/g, '\'');
      }
      // group styles
      for (const classGroup of Object.keys(classGroups)) {
        let styles = '';
        const classNames = classGroup.split(' ');
        for (let i = 0, l = classNames.length; i < l; i++) {
          const className = classNames[i];
          styles += classes[className] + ';';
        }
        // save styles to group
        classGroups[classGroup] = styles;
      }
      // replace
      const allClasses = { ... classGroups, ... classes };
      for(const key of Object.keys(allClasses)) {
        const styles = allClasses[key];
        content = content.replace(new RegExp('class="' + key + '"', 'g'), 'style="' + styles + '"');
      }
      // remove style tag
      content = content.replace(/\<style(.*?)\<\/style\>/g, '');
    }
    // full (default)

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
    const { cacheTime: globalCacheTime } = this.app.options;
    return (cacheTime === -1) ? 0 : Math.abs(cacheTime || globalCacheTime || 0);
  }
}