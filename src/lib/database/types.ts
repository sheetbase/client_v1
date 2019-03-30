export interface DatabaseOptions extends DatabasePublicOptions {
    databaseEndpoint?: string;
}

export interface DatabasePublicOptions {
    databasePublicId?: string;
    databaseGids?: {
        [sheetName: string]: string;
    };
}

export type AdvancedFilter = (item: any) => boolean;
export type ShorthandEqual = {[field: string]: any};
export type Filter = ShorthandEqual | Query | AdvancedFilter;
export interface Query {
    where: string;
    equal?: any;
    exists?: true;
    contains?: string;
    lt?: number;
    lte?: number;
    gt?: number;
    gte?: number;
    childExists?: any;
    childEqual?: string;
}

export type DocsContentStyles = 'clean' | 'minimal' | 'full';

export type DataRefresher<Data> = () => Promise<Data>;
