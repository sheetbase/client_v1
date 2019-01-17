// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { StorageService } from './storage.service';

function storage(app?: AppService) {
    return new StorageService(app);
}

export default storage;