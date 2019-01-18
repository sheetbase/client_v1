import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

function api(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['$$$SHEETBASE_APPS']) {
            throw new Error('No app for api component.');
        }
        app = window['$$$SHEETBASE_APPS'].getApp();
    }
    // return the instance
    if (!!app.Api) {
        return app.Api;
    } else {
        return new ApiService(app);
    }
}

export default api;
