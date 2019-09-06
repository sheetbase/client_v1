export interface DatabaseOptions extends DatabasePublicOptions, DatabaseParserOptions {
  databaseEndpoint?: string;
}

export interface DatabasePublicOptions {
  databaseId?: string;
  databaseGids?: DatabaseGids;
}

export interface DatabaseParserOptions {
  databaseDataParser?: DataParser;
}

export type AdvancedFilter = (item: any) => boolean;
export type ShorthandEqual = {[field: string]: any};
export type Filter = ShorthandEqual | Query | AdvancedFilter;
export interface Query {
  where: string;
  equal?: any;
  exists?: boolean;
  contains?: string;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  childExists?: any;
  childEqual?: string;
}

export type DocsContentStyle = 'clean' | 'full' | 'original';

export interface DataSegment {
  [field: string]: any;
}

export interface DatabaseGids {
  [sheet: string]: string;
}

export type DataParser = (value: any) => any;

export interface ItemsOptions {
  // caching
  useCached?: boolean;
  cacheTime?: number;
  // data
  segment?: DataSegment; // this or global, bypass global: {} (empty)
  // query
  order?: 'ASC' | 'DESC';
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface ItemOptions extends ItemsOptions {
  // content
  docsStyle?: DocsContentStyle;
  // auto-loaded content
  autoLoaded?: boolean;
}
