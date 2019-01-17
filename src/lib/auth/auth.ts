import { AppService } from '../app/app.service';
declare function app(): AppService; // get the default app

function auth(sheetbaseApp?: AppService) {
    return (sheetbaseApp || app()).Auth;
}

export default auth;