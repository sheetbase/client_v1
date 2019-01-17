import { AppService } from '../app/app.service';
import { StorageService } from './storage.service';

declare const sheetbase: any;

function storage(app?: AppService) {
    app = app || sheetbase.defaultApp();
    if (!!app.Storage) {
        return app.Storage;
    } else {
        return new StorageService(app);
    }
}

export default storage;