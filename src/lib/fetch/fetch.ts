import { AppService } from '../app/app.service';
import { FetchService } from './fetch.service';

function fetch(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for fetch component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Fetch) {
    return app.Fetch;
  } else {
    return new FetchService(app);
  }
}

export default fetch;

window['$$$SHEETBASE_COMPONENTS'].Fetch = FetchService;