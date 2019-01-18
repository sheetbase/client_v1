import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

function api(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['sheetbase'] || !window['sheetbase'].defaultApp) {
            throw new Error('No app for api component.');
        }
        app = window['sheetbase'].defaultApp();
    }
    // return the instance
    if (!!app.Api) {
        return app.Api;
    } else {
        return new ApiService(app);
    }
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].api = api;

export default api;