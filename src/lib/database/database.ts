// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { DatabaseService } from './database.service';

function database(app?: AppService) {
    return new DatabaseService(app);
}

export default database;