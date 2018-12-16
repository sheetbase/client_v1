import { Options } from './types';
import { AppsService } from './app';

const SHEETBASE_APPS = new AppsService();

export function initializeApp(options: Options, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}

export function app(name?: string) {
    return SHEETBASE_APPS.getApp(name);
}

export function api(appName?: string) {
    return SHEETBASE_APPS.getApp(appName).Api;
}

export function database(appName?: string) {
    return SHEETBASE_APPS.getApp(appName).Database;
}

export function auth(appName?: string) {
    return SHEETBASE_APPS.getApp(appName).Auth;
}

export function storage(appName?: string) {
    return SHEETBASE_APPS.getApp(appName).Storage;
}

export function mail(appName?: string) {
    return SHEETBASE_APPS.getApp(appName).Mail;
}