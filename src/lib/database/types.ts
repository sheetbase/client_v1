export interface DatabaseOptions extends DatabasePublicOptions {
  databaseEndpoint?: string;
}

export interface DatabasePublicOptions {
  databaseId?: string;
  databaseGids?: DatabaseGids;
}

export type Filter<Item> = Query | AdvancedFilter<Item>;

export type AdvancedFilter<Item> = (item: Item) => boolean;

export type Query = ShorthandQuery | SingleQuery | MultiQuery;

export type ShorthandQuery = {[field: string]: any};

export interface SingleQuery {
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

export interface MultiQuery {
  and?: SingleQuery[];
  or?: SingleQuery[];
}

export type DocsContentStyle = 'clean' | 'full' | 'original';

export interface DataSegment {
  [field: string]: any;
}

export interface DatabaseGids {
  [sheet: string]: string;
}

export type DataParser = (value: any) => any;

export type ListingOrder = 'asc' | 'desc';

export interface ListingFilter {
  order?: ListingOrder | ListingOrder[];
  orderBy?: string | string[];
  limit?: number; // +/- limit to first/last
  offset?: number;
}

export interface ItemsOptions extends ListingFilter {
  useCached?: boolean;
  cacheTime?: number;
  segment?: DataSegment; // this or global, bypass global: {} (empty)
}

export interface ItemOptions extends ItemsOptions {
  docsStyle?: DocsContentStyle;
  autoLoaded?: boolean; // json:// & content://
}
