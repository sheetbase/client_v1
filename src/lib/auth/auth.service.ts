import { publish, subscribe } from 'pubsub-js';

import { Options } from '../types';
import { ApiService } from '../api/api.service';
import { User } from './user';

const STATE_CHANGED_EVENT = 'SHEETBASE_AUTH_USER';

export class AuthService {
    private options: Options;
    private apiService: ApiService;

    currentUser: User = null;

    constructor(options: Options) {
        this.options = {
            authEndpoint: 'auth',
            ... options,
        };
        this.apiService = new ApiService(options);
    }

    private signIn(data: any) {
        const { profile, idToken, refreshToken } = data;
        this.currentUser = new User(this, this.apiService, profile, idToken, refreshToken);
        publish(STATE_CHANGED_EVENT, this.currentUser);
        return this.currentUser;
    }

    endpoint(paths?: string | string[]) {
        return this.apiService.buildEndpoint(this.options.authEndpoint, paths);
    }

    onAuthStateChanged(next: {(user: User)}) {
        subscribe(STATE_CHANGED_EVENT, (msg: any, user: User) => next(user));
    }

    async createUserWithEmailAndPassword(email: string, password: string) {
        const operationResponse = await this.apiService.put(this.endpoint(), {}, {
            email, password, offlineAccess: true,
        });
        const user = this.signIn(operationResponse);
        return { user };
    }

    async signInWithEmailAndPassword(email: string, password: string) {
        const operationResponse = await this.apiService.post(this.endpoint(), {}, {
            email, password, offlineAccess: true,
        });
        const user = this.signIn(operationResponse);
        return { user };
    }

    async signInWithCustomToken(token: string) {
        const operationResponse = await this.apiService.post(this.endpoint(), {}, {
            customToken: token, offlineAccess: true,
        });
        const user = this.signIn(operationResponse);
        return { user };
    }

    async sendPasswordResetEmail(email: string) {
        await this.apiService.put(this.endpoint('action'), {}, { mode: 'passwordReset', email });
    }

    async signOut() {
        this.currentUser = null;
        publish(STATE_CHANGED_EVENT, null);
    }

}