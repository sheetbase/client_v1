import { AppService } from '../app/app.service';
import { CacheService } from './cache.service';

function cache(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for cache component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Cache) {
    return app.Cache;
  } else {
    return new CacheService(app);
  }
}

export default cache;
