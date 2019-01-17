import { AppService } from '../app/app.service';
import { AuthService } from './auth.service';

declare const sheetbase: any;

function auth(app?: AppService) {
    app = app || sheetbase.defaultApp();
    if (!!app.Auth) {
        return app.Auth;
    } else {
        return new AuthService(app);
    }
}

export default auth;