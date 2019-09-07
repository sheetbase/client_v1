import { AppService } from '../app/app.service';
import { StorageService } from './storage.service';

function storage(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for storage component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Storage) {
    return app.Storage;
  } else {
    return new StorageService(app);
  }
}

export default storage;

window['$$$SHEETBASE_COMPONENTS'].Storage = StorageService;