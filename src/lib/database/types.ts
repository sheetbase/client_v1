export interface DatabaseOptions extends DatabasePublicOptions, DatabaseParserOptions {
    databaseEndpoint?: string;
}

export interface DatabasePublicOptions {
    databaseId?: string;
    databaseGids?: DatabaseGids;
}

export interface DatabaseParserOptions {
    databaseDataParser?: DatabaseDataParser;
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

export type DocsContentStyles = 'clean' | 'full' | 'original';

export interface DataSegment {
    [field: string]: any;
}

export interface DatabaseGids {
    [sheet: string]: string;
}

export type DatabaseDataParser = (value: any) => any;