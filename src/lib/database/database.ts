import { AppService } from '../app/app.service';
import { DatabaseService } from './database.service';

function database(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['sheetbase'] || !window['sheetbase'].defaultApp) {
            throw new Error('No app for database component.');
        }
        app = window['sheetbase'].defaultApp();
    }
    // return the instance
    if (!!app.Database) {
        return app.Database;
    } else {
        return new DatabaseService(app);
    }
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].database = database;

export default database;