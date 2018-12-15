import { Options } from './types';
import { AppsService } from './apps.service';

const SHEETBASE_APPS = new AppsService();

export const App = SHEETBASE_APPS.getApp(); // default app, if exists

export function app(name?: string) {
    return SHEETBASE_APPS.getApp(name);
}

export function initializeApp(options: Options, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}
