import { Options } from './types';
import { AppsService, App } from './app';

const SHEETBASE_APPS = new AppsService();

export function initializeApp(options: Options, name?: string) {
    return SHEETBASE_APPS.createApp(options, name);
}

export function app(name?: string) {
    return SHEETBASE_APPS.getApp(name);
}

export function api(app?: App) {
    app = app || SHEETBASE_APPS.getApp();
    return app.Api;
}

export function database(app?: App) {
    app = app || SHEETBASE_APPS.getApp();
    return app.Database;
}

export function auth(app?: App) {
    app = app || SHEETBASE_APPS.getApp();
    return app.Auth;
}

export function storage(app?: App) {
    app = app || SHEETBASE_APPS.getApp();
    return app.Storage;
}

export function mail(app?: App) {
    app = app || SHEETBASE_APPS.getApp();
    return app.Mail;
}