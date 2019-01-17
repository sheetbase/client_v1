import { AppService } from '../app/app.service';
declare function app(): AppService; // get the default app

function database(sheetbaseApp?: AppService) {
    return (sheetbaseApp || app()).Database;
}

export default database;