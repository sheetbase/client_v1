import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { MockedAppService } from './_mocks';

import { DatabaseDirectService } from '../src/lib/database/direct';

let databaseDirectService: DatabaseDirectService;

let fetchGetStub: sinon.SinonStub;

function before() {
  databaseDirectService = new DatabaseDirectService(
    new MockedAppService() as any,
  );
  // stubs
  fetchGetStub = sinon.stub(databaseDirectService.app.Fetch, 'get');
}

function after() {
  fetchGetStub.restore();
}

describe('(Database) Database direct service', () => {

  beforeEach(before);
  afterEach(after);

  it('properties', () => {
    expect(databaseDirectService.app instanceof MockedAppService).equal(true);
    // @ts-ignore
    expect(databaseDirectService.BUILTIN_PUBLIC_GIDS).eql({
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
    });
    // @ts-ignore
    expect(databaseDirectService.AUTO_LOADED_JSON_SCHEME).equal('json://');
    // @ts-ignore
    expect(databaseDirectService.AUTO_LOADED_TEXT_SCHEME).equal('content://');
    // @ts-ignore
    expect(databaseDirectService.databaseId).equal('1Abc');
    // @ts-ignore
    expect(databaseDirectService.databaseGids).eql({ xxx: '123' });
    // @ts-ignore
    expect(databaseDirectService.customDataParser).equal(undefined);
  });

  it('#registerDataParser', () => {
    const result = databaseDirectService.registerDataParser(value => value);
    // @ts-ignore
    expect(databaseDirectService.customDataParser('xxx')).equal('xxx');
    expect(result instanceof DatabaseDirectService).equal(true);
  });

  it('#hasDirectAccess (no database id)', () => {
    databaseDirectService.app.options.databaseId = null;
    // @ts-ignore
    const result = databaseDirectService.hasDirectAccess('categories');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (no direct access)', () => {
    // @ts-ignore
    const result = databaseDirectService.hasDirectAccess('xxx2');
    expect(result).equal(false);
  });

  it('#hasDirectAccess (has direct access)', () => {
    // @ts-ignore
    const result = databaseDirectService.hasDirectAccess('categories');
    expect(result).equal(true);
  });

  it('#hasDirectAccess (custom gids)', () => {
    // @ts-ignore
    const result = databaseDirectService.hasDirectAccess('xxx');
    expect(result).equal(true);
  });

  it('#isUrl', () => {
    // @ts-ignore
    const result1 = databaseDirectService.isUrl('xxx');
    // @ts-ignore
    const result2 = databaseDirectService.isUrl('http://xxx.xxx');
    // @ts-ignore
    const result3 = databaseDirectService.isUrl('https://xxx.xxx');
    expect(result1).equal(false);
    expect(result2).equal(true);
    expect(result3).equal(true);
  });

  it('#isFileId', () => {
    // @ts-ignore
    const result1 = databaseDirectService.isFileId('xxx');
    // @ts-ignore
    const result2 = databaseDirectService.isFileId('17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W');
    expect(result1).equal(false);
    expect(result2).equal(true);
  });

  it('#isDocId', () => {
    // @ts-ignore
    const result1 = databaseDirectService.isDocId('xxx');
    // @ts-ignore
    const result2 = databaseDirectService.isDocId('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc');
    expect(result1).equal(false);
    expect(result2).equal(true);
  });

  it.skip('#buildFileUrl');

  it('#buildAutoLoadedValue (any or doc id)', () => {
    // @ts-ignore
    const result1 = databaseDirectService.buildAutoLoadedValue('xxx', '');
    // @ts-ignore
    const result2 = databaseDirectService.buildAutoLoadedValue('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc', '');
    expect(result1).equal('xxx');
    expect(result2).equal('1u1J4omqU7wBKJTspw53p6U_B_IA2Rxsac4risNxwTTc');
  });

  it('#buildAutoLoadedValue (url)', () => {
    // @ts-ignore
    const result = databaseDirectService.buildAutoLoadedValue('json://https://xxx.xxx', 'json://');
    expect(result).equal('https://xxx.xxx');
  });

  it('#buildAutoLoadedValue (file id)', () => {
    // @ts-ignore
    const result = databaseDirectService.buildAutoLoadedValue(
      'content://17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W', 'content://');
    expect(result).equal(
      'https://drive.google.com/uc?id=17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W');
  });

  it('#buildPublishedUrl', () => {
    const result = databaseDirectService.buildPublishedUrl('xxx');
    expect(result).equal(
      'https://docs.google.com/spreadsheets/d/1Abc/pub?gid=123&output=csv&single=true',
    );
  });

  it('#parseCSV', async () => {
    const result = await databaseDirectService.parseCSV(
      'a,b,c\n' +
      '1,2,3',
    );
    expect(result).eql([
      {
        a: '1',
        b: '2',
        c: '3',
      },
    ]);
  });

  it('#parseData (no custom parser)', () => {
    const result = databaseDirectService.parseData({
      // basic
      a0: '',
      a1: null,
      a2: undefined,
      b1: 0,
      b2: 1,
      b3: '2',
      c1: true,
      c2: false,
      c3: 'true',
      c4: 'FALSE',
      d: '{"a":1}',
      // builtin
      e: '17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
      // custom
      f: 'me:xxx',
    });
    expect(result).eql({
      // basic
      // a0: '',
      // a1: null,
      // a2: undefined,
      b1: 0,
      b2: 1,
      b3: 2,
      c1: true,
      c2: false,
      c3: true,
      c4: false,
      d: { a: 1 },
      // builtin
      e: 'https://drive.google.com/uc?id=17wmkJn5wDY8o_91kYw72XLT_NdZS3u0W',
      // custom
      f: 'me:xxx',
    });
  });

  it('#parseData (has custom parser)', () => {
    // @ts-ignore
    databaseDirectService.customDataParser = (value) => {
      if (
        typeof value === 'string' &&
        value.indexOf('me:') !== -1
      ) {
        value = 'new_' + value;
      }
      return value;
    };
    const result = databaseDirectService.parseData({
      a: 1,
      b: 'xxx',
      // custom
      c: 'me:xxx',
    });
    expect(result).eql({
      a: 1,
      b: 'xxx',
      // custom
      c: 'new_me:xxx',
    });
  });

  it('#processDocsContent', () => {
    // tslint:disable-next-line: max-line-length
    const original = `<html><head><meta content="text/html; charset=UTF-8" http-equiv="content-type"><style type="text/css">ol{margin:0;padding:0}table td,table th{padding:0}.c3{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:"Arial";font-style:normal}.c0{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;height:11pt}.c2{color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:12pt;font-family:"Arial";font-style:normal}.c1{padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left}.c4{background-color:#ffffff;max-width:468pt;padding:72pt 72pt 72pt 72pt}.title{padding-top:0pt;color:#000000;font-size:26pt;padding-bottom:3pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}.subtitle{padding-top:0pt;color:#666666;font-size:15pt;padding-bottom:16pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}li{color:#000000;font-size:11pt;font-family:"Arial"}p{margin:0;color:#000000;font-size:11pt;font-family:"Arial"}h1{padding-top:20pt;color:#000000;font-size:20pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h2{padding-top:18pt;color:#000000;font-size:16pt;padding-bottom:6pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h3{padding-top:16pt;color:#434343;font-size:14pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h4{padding-top:14pt;color:#666666;font-size:12pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h5{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;orphans:2;widows:2;text-align:left}h6{padding-top:12pt;color:#666666;font-size:11pt;padding-bottom:4pt;font-family:"Arial";line-height:1.15;page-break-after:avoid;font-style:italic;orphans:2;widows:2;text-align:left}</style></head><body class="c4"><div><p class="c0"><span class="c3"></span></p></div><p class="c1"><span class="c2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consequat auctor ullamcorper. Integer pellentesque ex a neque scelerisque volutpat. Vivamus quis sem rutrum, scelerisque tellus ac, rutrum magna. Nam vulputate orci turpis, et sollicitudin lectus ultrices quis. Maecenas pharetra nunc porta ex maximus, ut dictum tellus tempus. Fusce ac massa id dui mollis efficitur id sit amet tellus. Aliquam quam mauris, malesuada dictum pretium vitae, dapibus a libero. Vivamus luctus nibh at ex condimentum, quis aliquet eros suscipit. Quisque est dolor, tincidunt sit amet leo sed, volutpat vehicula sem. Proin sed tincidunt nibh. Pellentesque dui elit, rutrum nec tempor semper, lobortis sit amet metus.</span></p><p class="c1"><span class="c2">Sed eros augue, accumsan non commodo eget, luctus quis ligula. Maecenas sed mi rhoncus ante aliquam dapibus varius sit amet nulla. Proin faucibus urna neque. Suspendisse semper vel tortor ac faucibus. Aliquam non tincidunt velit. Vestibulum suscipit orci neque, eget iaculis justo euismod vitae. Etiam vitae massa arcu. Curabitur sed imperdiet nibh, vel eleifend diam. Duis at eros ligula. Aliquam quis euismod neque.</span></p><p class="c1"><span class="c2">Duis nisl velit, posuere nec cursus quis, consequat dictum est. Mauris vulputate nulla ac leo dapibus, ut ultricies libero lobortis. Sed lobortis, ligula in sodales efficitur, orci nunc vehicula elit, eget sagittis mi ex at velit. Praesent commodo pellentesque rhoncus. Curabitur at tristique urna. Fusce eget felis velit. Duis tortor ipsum, volutpat eget nisi ac, efficitur condimentum turpis. Praesent non lectus lorem. Curabitur gravida arcu nec neque gravida, non placerat orci consectetur. Phasellus nec sollicitudin leo. Curabitur non elit eget nunc eleifend eleifend sit amet nec nibh.</span></p></body></html>`;
    // tslint:disable-next-line: max-line-length
    const full = `<div><p style="padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;height:11pt;"><span style="color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:11pt;font-family:'Arial';font-style:normal;"></span></p></div><p style="padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;"><span style="color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:12pt;font-family:'Arial';font-style:normal;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consequat auctor ullamcorper. Integer pellentesque ex a neque scelerisque volutpat. Vivamus quis sem rutrum, scelerisque tellus ac, rutrum magna. Nam vulputate orci turpis, et sollicitudin lectus ultrices quis. Maecenas pharetra nunc porta ex maximus, ut dictum tellus tempus. Fusce ac massa id dui mollis efficitur id sit amet tellus. Aliquam quam mauris, malesuada dictum pretium vitae, dapibus a libero. Vivamus luctus nibh at ex condimentum, quis aliquet eros suscipit. Quisque est dolor, tincidunt sit amet leo sed, volutpat vehicula sem. Proin sed tincidunt nibh. Pellentesque dui elit, rutrum nec tempor semper, lobortis sit amet metus.</span></p><p style="padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;"><span style="color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:12pt;font-family:'Arial';font-style:normal;">Sed eros augue, accumsan non commodo eget, luctus quis ligula. Maecenas sed mi rhoncus ante aliquam dapibus varius sit amet nulla. Proin faucibus urna neque. Suspendisse semper vel tortor ac faucibus. Aliquam non tincidunt velit. Vestibulum suscipit orci neque, eget iaculis justo euismod vitae. Etiam vitae massa arcu. Curabitur sed imperdiet nibh, vel eleifend diam. Duis at eros ligula. Aliquam quis euismod neque.</span></p><p style="padding-top:0pt;padding-bottom:0pt;line-height:1.15;orphans:2;widows:2;text-align:left;"><span style="color:#000000;font-weight:400;text-decoration:none;vertical-align:baseline;font-size:12pt;font-family:'Arial';font-style:normal;">Duis nisl velit, posuere nec cursus quis, consequat dictum est. Mauris vulputate nulla ac leo dapibus, ut ultricies libero lobortis. Sed lobortis, ligula in sodales efficitur, orci nunc vehicula elit, eget sagittis mi ex at velit. Praesent commodo pellentesque rhoncus. Curabitur at tristique urna. Fusce eget felis velit. Duis tortor ipsum, volutpat eget nisi ac, efficitur condimentum turpis. Praesent non lectus lorem. Curabitur gravida arcu nec neque gravida, non placerat orci consectetur. Phasellus nec sollicitudin leo. Curabitur non elit eget nunc eleifend eleifend sit amet nec nibh.</span></p>`;
    // tslint:disable-next-line: max-line-length
    const clean = `<div><p><span></span></p></div><p><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consequat auctor ullamcorper. Integer pellentesque ex a neque scelerisque volutpat. Vivamus quis sem rutrum, scelerisque tellus ac, rutrum magna. Nam vulputate orci turpis, et sollicitudin lectus ultrices quis. Maecenas pharetra nunc porta ex maximus, ut dictum tellus tempus. Fusce ac massa id dui mollis efficitur id sit amet tellus. Aliquam quam mauris, malesuada dictum pretium vitae, dapibus a libero. Vivamus luctus nibh at ex condimentum, quis aliquet eros suscipit. Quisque est dolor, tincidunt sit amet leo sed, volutpat vehicula sem. Proin sed tincidunt nibh. Pellentesque dui elit, rutrum nec tempor semper, lobortis sit amet metus.</span></p><p><span>Sed eros augue, accumsan non commodo eget, luctus quis ligula. Maecenas sed mi rhoncus ante aliquam dapibus varius sit amet nulla. Proin faucibus urna neque. Suspendisse semper vel tortor ac faucibus. Aliquam non tincidunt velit. Vestibulum suscipit orci neque, eget iaculis justo euismod vitae. Etiam vitae massa arcu. Curabitur sed imperdiet nibh, vel eleifend diam. Duis at eros ligula. Aliquam quis euismod neque.</span></p><p><span>Duis nisl velit, posuere nec cursus quis, consequat dictum est. Mauris vulputate nulla ac leo dapibus, ut ultricies libero lobortis. Sed lobortis, ligula in sodales efficitur, orci nunc vehicula elit, eget sagittis mi ex at velit. Praesent commodo pellentesque rhoncus. Curabitur at tristique urna. Fusce eget felis velit. Duis tortor ipsum, volutpat eget nisi ac, efficitur condimentum turpis. Praesent non lectus lorem. Curabitur gravida arcu nec neque gravida, non placerat orci consectetur. Phasellus nec sollicitudin leo. Curabitur non elit eget nunc eleifend eleifend sit amet nec nibh.</span></p>`;

    const result1 = databaseDirectService.processDocsContent(original, 'original');
    const result2 = databaseDirectService.processDocsContent(original);
    const result3 = databaseDirectService.processDocsContent(original, 'clean');
    expect(result1).equal(original);
    expect(result2).equal(full);
    expect(result3).equal(clean);
  });

  it.skip('#loadItemContent');

  it('#all', async () => {
    let fetchGetArgs;
    fetchGetStub.callsFake((...args) => {
      fetchGetArgs = args;
      return (
        'a,b,c\n' +
        '1,2,3\n' +
        ',,\n' +
        '4,5,6'
      );
    });

    const result = await databaseDirectService.all('xxx');
    expect(fetchGetArgs).eql([
      'https://docs.google.com/spreadsheets/d/1Abc/pub?gid=123&output=csv&single=true',
      {},
      false,
    ]);
    expect(result).eql([
      { _row: 2, a: 1, b: 2, c: 3 },
      { _row: 4, a: 4, b: 5, c: 6 },
    ]);
  });

  it('#docsContent', async () => {
    let fetchGetArgs;
    fetchGetStub.callsFake((...args) => {
      fetchGetArgs = args;
      return '<p>doc content ...</p>';
    });

    const result = await databaseDirectService.docsContent(
      'doc-id-xxx',
    );

    expect(fetchGetArgs).eql([
      'https://docs.google.com/document/d/doc-id-xxx/pub?embedded=true',
      {},
      false,
    ]);
    expect(result).equal('<p>doc content ...</p>');
  });

  it.skip('#textContent');

  it.skip('#jsonContent');

});
