import { AppService } from '../app/app.service';
import { DatabaseService } from './database.service';

function database(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for database component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Database) {
    return app.Database;
  } else {
    return new DatabaseService(app);
  }
}

export default database;

window['$$$SHEETBASE_COMPONENTS'].Database = DatabaseService;