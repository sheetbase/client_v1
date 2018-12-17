import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class AuthService {
    private options: Options;
    private apiService: ApiService;

    constructor(options: Options) {
        this.options = options;
        this.apiService = new ApiService(options);
    }

}