import { AppService } from '../app/app.service';
import { MailService } from './mail.service';

declare const sheetbase: any;

function mail(app?: AppService) {
    app = app || sheetbase.defaultApp();
    if (!!app.Mail) {
        return app.Mail;
    } else {
        return new MailService(app);
    }
}

export default mail;