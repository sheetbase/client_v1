import { Options } from './types';
import { App } from './app';

export class AppsService {
    private apps: { [name: string]: App } = {};

    constructor() {}

    createApp(options: Options, name = 'DEFAULT') {
        if (!!this.apps[name]) {
            throw new Error(`App exists with the name "${name}".`);
        }
        this.apps[name] = new App(options);
        return this.apps[name];
    }

    getApp(name = 'DEFAULT') {
        return this.apps[name];
    }

    removeApp(name: string) {
        delete this.apps[name];
    }

}