import { Options } from './types';
import { ApiService } from './api.service';

export class App {
    private _options: Options;

    Api: ApiService;

    constructor(options: Options) {
        this._options = { ... options };
        // member
        this.Api = new ApiService(this);
    }

    options() {
        return this._options;
    }

    api() {
        return this.Api;
    }

}