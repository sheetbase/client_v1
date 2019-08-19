export interface ApiOptions {
    backendUrl?: string;
    apiKey?: string;
    cacheTime?: number;
}

export interface ActionData {
    endpoint?: string;
    query?: {};
    body?: {};
}

export interface BeforeRequestHook {
    (data: ActionData): Promise<ActionData>;
}

export interface ApiInstanceData extends ActionData {
    beforeHooks?: BeforeRequestHook[];
}

export interface ResponseError {
    error?: boolean;
    code?: string;
    message?: string;
    status?: number;
    meta?: {
        at?: number;
        [key: string]: any;
    };
}

export interface ResponseSuccess {
    data: any;
    success?: boolean;
    status?: number;
    meta?: {
        at?: number;
        [key: string]: any;
    };
}