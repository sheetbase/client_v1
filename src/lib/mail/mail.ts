import { AppService } from '../app/app.service';
import { MailService } from './mail.service';

function mail(app?: AppService) {
  // get the default app
  if (!app) {
    if (!window['$$$SHEETBASE_APPS']) {
      throw new Error('No app for mail component.');
    }
    app = window['$$$SHEETBASE_APPS'].getApp();
  }
  // return the instance
  if (!!app.Mail) {
    return app.Mail;
  } else {
    return new MailService(app);
  }
}

export default mail;

window['$$$SHEETBASE_COMPONENTS'].Mail = MailService;