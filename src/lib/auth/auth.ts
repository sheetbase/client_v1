// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { AuthService } from './auth.service';

function auth(app?: AppService) {
    return new AuthService(app);
}

export default auth;