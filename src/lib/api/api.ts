// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

function api(app?: AppService) {
    return new ApiService(app);
}

export default api;