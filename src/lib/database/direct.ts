import { parse } from 'papaparse';

import { AppService } from '../app/app.service';
import { parseObject } from '../utils';

import { DocsContentStyles } from './types';

export class DatabaseDirectService {

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
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

  async docsContent(
    docUrl: string,
    style: DocsContentStyles = 'full',
    cacheTime = 0,
  ): Promise<{ docId?: string; content: string; }> {
    // get doc id
    const docId = docUrl
      .replace('https://docs.google.com/document/d/', '')
      .split('/')
      .shift();
    // get data
    const content = await this.app.Cache.getRefresh<string>(
      'content_' + docId + '_' + style,
      cacheTime,
      async () => {
        // fetch html content
        const html: string = await this.app.Fetch.get(
          'https://docs.google.com/document/d/' + docId + '/pub?embedded=true', {}, { json: false },
        );
        // parse
        return await this.parseDocsContent(html, style);
      },
    );
    return { docId, content };
  }

  private csvUrl(sheet: string) {
    const { databaseId, databaseGids } = this.app.options;
    return `https://docs.google.com/spreadsheets/d/`
      + databaseId +
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