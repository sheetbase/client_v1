import { FileResource } from '@sheetbase/drive-server';

import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

export class StorageService {

    private Api: ApiService;

    app: AppService;

    constructor(app: AppService) {
        this.app = app;
        this.Api = this.app.Api
            .extend()
            .setEndpoint(this.app.options.authEndpoint || 'storage');
    }

    async info(fileId: string) {
        return await this.Api.get('/', { id: fileId });
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
        return await this.Api.post('/', {}, body);
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