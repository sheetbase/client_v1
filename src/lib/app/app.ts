import { AppOptions } from './types';
import { AppsService, AppService } from './app.service';

const SHEETBASE_APPS = new AppsService();

function initializeApp(options?: AppOptions, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}

function defaultApp() {
    return SHEETBASE_APPS.getApp();
}

function app(name: string) {
    return SHEETBASE_APPS.getApp(name);
}

export { AppService as App, initializeApp, defaultApp, app };
export * from '../api/index';
export * from '../fetch/index';
export * from '../localstorage/index';
export * from '../cache/index';

window['$$$SHEETBASE_APPS'] = SHEETBASE_APPS;
window['$$$SHEETBASE_COMPONENTS'] = {};
