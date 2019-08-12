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