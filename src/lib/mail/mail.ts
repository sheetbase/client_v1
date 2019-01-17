import { AppService } from '../app/app.service';
declare function app(): AppService; // get the default app

function mail(sheetbaseApp?: AppService) {
    return (sheetbaseApp || app()).Mail;
}

export default mail;