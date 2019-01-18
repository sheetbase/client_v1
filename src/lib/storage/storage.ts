import { AppService } from '../app/app.service';
import { StorageService } from './storage.service';

function storage(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['sheetbase'] || !window['sheetbase'].defaultApp) {
            throw new Error('No app for storage component.');
        }
        app = window['sheetbase'].defaultApp();
    }
    // return the instance
    if (!!app.Storage) {
        return app.Storage;
    } else {
        return new StorageService(app);
    }
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].storage = storage;

export default storage;