// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { MailService } from './mail.service';

declare function app(): AppService;

function mail(sheetbaseApp?: AppService) {
    return new MailService(sheetbaseApp || app());
}

export default mail;