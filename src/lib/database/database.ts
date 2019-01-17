// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { DatabaseService } from './database.service';

declare function app(): AppService;

function database(sheetbaseApp?: AppService) {
    return new DatabaseService(sheetbaseApp || app());
}

export default database;