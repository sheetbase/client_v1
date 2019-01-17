import { AppOptions } from './types';

export class AppsService {

    private apps: { [name: string]: AppService } = {};

    constructor() {}

    createApp(options: AppOptions, name = 'DEFAULT') {
        if (!!this.apps[name]) {
            throw new Error(`An app exists with the name "${name}".`);
        }
        this.apps[name] = new AppService(options);
        return this.apps[name];
    }

    getApp(name = 'DEFAULT') {
        const app = this.apps[name];
        if (!app) {
            throw new Error(`No app exists with the name "${name}". Please run initializeApp() first.`);
        }
        return app;
    }

}

export class AppService {

    options: AppOptions;

    constructor(options: AppOptions) {
        this.options = options;
    }

    getOptions() {
        return this.options;
    }

}
