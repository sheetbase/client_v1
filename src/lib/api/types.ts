import { ApiService } from './api.service';

export interface ApiOptions {
    backendUrl: string;
    apiKey?: string;
}

export interface BeforeRequest {
    (Api: ApiService): Promise<void>;
}

export interface ApiInstanceData {
    endpoint?: string;
    query?: {};
    body?: {};
    before?: BeforeRequest;
}