import { AppService } from '../app/app.service';
import { LocalstorageService } from './localstorage.service';

function localstorage(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for localstorage component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Localstorage) {
    return app.Localstorage;
  } else {
    return new LocalstorageService(app);
  }
}

export default localstorage;

window['$$$SHEETBASE_COMPONENTS'].Localstorage = LocalstorageService;