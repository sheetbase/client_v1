// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { StorageService } from './storage.service';

declare function app(): AppService;

function storage(sheetbaseApp?: AppService) {
    return new StorageService(sheetbaseApp || app());
}

export default storage;