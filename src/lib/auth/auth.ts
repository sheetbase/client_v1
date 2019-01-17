// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { AuthService } from './auth.service';

declare function app(): AppService;

function auth(sheetbaseApp?: AppService) {
    return new AuthService(sheetbaseApp || app());
}

export default auth;