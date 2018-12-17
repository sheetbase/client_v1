import { Options } from '../types';
import { ApiService } from './api.service';

export { Options, ApiService };

export function api(options: Options) {
    return new ApiService(options);
}

export function initializeApp(options: Options) {
    const Api = api(options);
    return { Api, api: () => Api };
}