export interface StorageOptions {
    storageEndpoint?: string;
}

export interface FileResource {
    name: string;
    base64Data: string;
    size?: number;
}