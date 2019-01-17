import { AppOptions } from './types';
import { AppsService, AppService } from './app.service';

const SHEETBASE_APPS = new AppsService();

function initializeApp(options: AppOptions, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}

function app(name?: string) {
    return SHEETBASE_APPS.getApp(name);
}

export { AppService as App, initializeApp, app };
export * from './types';
