import { AppService } from '../app/app.service';
declare function app(): AppService; // get the default app

function api(sheetbaseApp?: AppService) {
    return (sheetbaseApp || app()).Api;
}

export default api;