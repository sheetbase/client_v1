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
    '1Abc', // database id
    { xxx: '123' }, // gids
    undefined, // custom parser
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
    expect(databaseDirectService.databaseId).equal('1Abc');
    // @ts-ignore
    expect(databaseDirectService.databaseGids).eql({ xxx: '123' });
    // @ts-ignore
    expect(databaseDirectService.customDataParser).equal(undefined);
  });

  it('#getPublishedUrl', () => {
    const result = databaseDirectService.getPublishedUrl('xxx');
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

    const cacheGetArgs: any = await databaseDirectService.all('xxx');
    const result = await cacheGetArgs[1]();

    expect(fetchGetArgs).eql([
      'https://docs.google.com/spreadsheets/d/1Abc/pub?gid=123&output=csv&single=true',
      {},
      { json: false },
    ]);
    expect(cacheGetArgs[0]).equal('database_xxx');
    expect(cacheGetArgs[2]).equal(0);
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

    const cacheGetArgs: any = await databaseDirectService.docsContent(
      'xxx-1',
      'doc-id-xxx',
    );
    const result = await cacheGetArgs[1]();

    expect(fetchGetArgs).eql([
      'https://docs.google.com/document/d/doc-id-xxx/pub?embedded=true',
      {},
      { json: false },
    ]);
    expect(cacheGetArgs[0]).equal('content_xxx-1_doc-id-xxx_full');
    expect(cacheGetArgs[2]).equal(0);
    expect(result).equal('<p>doc content ...</p>');
  });

  it('#textContent', async () => {
    let fetchGetArgs;
    fetchGetStub.callsFake((...args) => {
      fetchGetArgs = args;
      return '<p>content ...</p>';
    });

    const cacheGetArgs: any = await databaseDirectService.textContent(
      'xxx-1',
      'https://xxx.xxx',
    );
    const result = await cacheGetArgs[1]();

    expect(fetchGetArgs).eql([
      'https://xxx.xxx',
      {},
      { json: false },
    ]);
    expect(cacheGetArgs[0]).equal('content_xxx-1_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(0);
    expect(result).equal('<p>content ...</p>');
  });

  it('#jsonContent', async () => {
    let fetchGetArgs;
    fetchGetStub.callsFake((...args) => {
      fetchGetArgs = args;
      return { a: 1, b: 2, c: 3 };
    });

    const cacheGetArgs: any = await databaseDirectService.jsonContent(
      'xxx-1',
      'https://xxx.xxx',
    );
    const result = await cacheGetArgs[1]();

    expect(fetchGetArgs).eql([
      'https://xxx.xxx',
    ]);
    expect(cacheGetArgs[0]).equal('content_xxx-1_6b89c305ffa17e4cd1c7d839566ff058');
    expect(cacheGetArgs[2]).equal(0);
    expect(result).eql({ a: 1, b: 2, c: 3 });
  });

});