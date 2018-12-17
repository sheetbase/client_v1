import { FileResource } from '@sheetbase/drive-server';

import { Options } from '../types';
import { ApiService } from '../api/api.service';

export class StorageService {
    private options: Options;
    private apiService: ApiService;

    constructor(options: Options) {
        this.options = {
            storageEndpoint: 'storage',
            ... options,
        };
        this.apiService = new ApiService(options);
    }

    endpoint() {
        return '/' + this.options.storageEndpoint;
    }

    async info(fileId: string) {
        return await this.apiService.get(this.endpoint(), { id: fileId });
    }

    async upload(
        fileResource: FileResource,
        customFolder?: string,
        rename?: string,
    ) {
        if (!fileResource) {
            throw new Error('No file resource');
        }
        // request body
        const body: any = { fileResource };
        if (customFolder) { body.customFolder = customFolder; }
        if (rename) { body.rename = rename; }
        return await this.apiService.post(this.endpoint(), {}, body);
    }

    async load(file: File) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file.');
            }
            // read the file
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const base64Data = e.target.result;
                const { name, size } = file;
                resolve({ name, size, base64Data });
            };
            reader.readAsDataURL(file);
        });
    }

}