export interface DatabaseOptions {
    databaseEndpoint?: string;
}

export interface Query {
    where: string;
    equal?: any;
}

export type AdvancedFilter = (item: any) => boolean;
export type Filter = {[field: string]: any} | Query | AdvancedFilter;
