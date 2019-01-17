import { AppService } from '../app/app.service';
import { DatabaseService } from './database.service';

declare const sheetbase: any;

function database(app?: AppService) {
    app = app || sheetbase.defaultApp();
    if (!!app.Database) {
        return app.Database;
    } else {
        return new DatabaseService(app);
    }
}

export default database;