import { AppOptions } from './types';
import { AppsService } from './app.service';

const SHEETBASE_APPS = new AppsService();

function initializeApp(options: AppOptions, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}

function defaultApp() {
    return SHEETBASE_APPS.getApp();
}

function app(name: string) {
    return SHEETBASE_APPS.getApp(name);
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].defaultApp = defaultApp;

export { initializeApp, defaultApp, app };
