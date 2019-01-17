// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

declare function app(): AppService;

function api(sheetbaseApp?: AppService) {
    return new ApiService(sheetbaseApp || app());
}

export default api;