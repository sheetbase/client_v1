import { AppService } from '../app/app.service';
import { MailService } from './mail.service';

function mail(app?: AppService) {
    // get the default app
    if (!app) {
        if (!window['sheetbase'] || !window['sheetbase'].defaultApp) {
            throw new Error('No app for mail component.');
        }
        app = window['sheetbase'].defaultApp();
    }
    // return the instance
    if (!!app.Mail) {
        return app.Mail;
    } else {
        return new MailService(app);
    }
}

window['sheetbase'] = window['sheetbase'] || {};
window['sheetbase'].mail = mail;

export default mail;