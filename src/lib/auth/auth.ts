import { AppService } from '../app/app.service';
import { AuthService } from './auth.service';

function auth(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['$$$SHEETBASE_APPS']) {
            throw new Error('No app for auth component.');
        }
        app = window['$$$SHEETBASE_APPS'].getApp();
    }
    // return the instance
    if (!!app.Auth) {
        return app.Auth;
    } else {
        return new AuthService(app);
    }
}

export default auth;

window['$$$SHEETBASE_COMPONENTS'].Auth = AuthService;