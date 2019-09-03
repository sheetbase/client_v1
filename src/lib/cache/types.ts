export interface CacheOptions {
  cacheTime?: number; // global cache time
}

export type CacheRefresher<Data> = () => Promise<Data>;

export interface AlwaysCachedResult<Data> {
  data: Data;
  expired: boolean;
}
