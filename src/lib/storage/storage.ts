import { AppService } from '../app/app.service';
declare function app(): AppService; // get the default app

function storage(sheetbaseApp?: AppService) {
    return (sheetbaseApp || app()).Storage;
}

export default storage;