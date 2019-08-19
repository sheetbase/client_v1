export interface StorageOptions extends StorageLimitOptions {
  storageEndpoint?: string;
}

export interface StorageLimitOptions {
  storageAllowTypes?: string[]; // mimetype list
  storageMaxSize?: number; // size limit
}

export interface FileReaderResult {
  name: string;
  size: number;
  base64Value: string;
}

export interface UploadFile {
  name: string;
  base64Value: string;
}

export interface UploadResource {
  file: UploadFile;
  folder?: string;
  rename?: RenamePolicy;
  share?: FileSharing;
}

export interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  description: string;
  size: number;
  link: string;
  url: string;
  downloadUrl: string;
}

export type RenamePolicy = 'AUTO' | 'HASH';

export type FileSharing = SharingPreset | SharingConfig;
export type SharingPreset = 'PUBLIC' | 'PRIVATE';
export interface SharingConfig {
  access?: string;
  permission?: string;
}

export interface FileUpdateData {
  name?: string;
  description?: string;
  sharing?: FileSharing;
  content?: string; // text file only
}
