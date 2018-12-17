import { Options } from '../types';
import { MailService } from './mail.service';

export function mail(options: Options) {
    return new MailService(options);
}