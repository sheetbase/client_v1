import { Options } from '../types';
import { AuthService } from './auth.service';

export function auth(options: Options) {
    return new AuthService(options);
}
