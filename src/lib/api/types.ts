export interface ApiOptions {
    backendUrl: string;
    apiKey?: string;
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