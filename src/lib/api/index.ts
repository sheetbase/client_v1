import { AppService } from '../app/app.service';
import { ApiService } from './api.service';

function api(app?: AppService) {
    return new ApiService(app);
}

export { ApiService as Api, api };
export * from './types';
