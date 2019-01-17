// tslint:disable:no-default-export
import { AppService } from '../app/app.service';
import { MailService } from './mail.service';

function mail(app?: AppService) {
    return new MailService(app);
}

export default mail;