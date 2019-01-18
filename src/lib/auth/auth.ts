import { AppService } from '../app/app.service';
import { AuthService } from './auth.service';

function auth(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['sheetbase'] || !window['sheetbase'].defaultApp) {
            throw new Error('No app for auth component.');
        }
        app = window['sheetbase'].defaultApp();
    }
    // return the instance
    if (!!app.Auth) {
        return app.Auth;
    } else {
        return new AuthService(app);
    }
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].auth = auth;

export default auth;