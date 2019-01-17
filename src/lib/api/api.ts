import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

declare const sheetbase: any;

function api(app?: AppService) {
    app = app || sheetbase.defaultApp();
    if (!!app.Api) {
        return app.Api;
    } else {
        return new ApiService(app);
    }
}

export default api;