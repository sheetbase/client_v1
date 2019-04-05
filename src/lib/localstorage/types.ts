export interface LocalstorageConfigs {
  name?: string;
  storeName?: string;
  driver?: string | string[];
  size?: number;
  version?: number;
  description?: string;
}

export type LocalstorageIterateHandler<Data> = (
  value: Data,
  key: string,
  iterationNumber: number,
) => Promise<any>;

export type LocalstorageIterateKeysHandler = (
  key: string,
  iterationNumber: number,
) => Promise<any>;