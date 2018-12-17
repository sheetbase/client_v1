import { Options } from '../types';
import { AuthService } from './auth.service';

export function auth(options: Options) {
    return new AuthService(options);
}

export function initializeApp(options: Options) {
    const Auth = auth(options);
    return { Auth, auth: () => Auth };
}