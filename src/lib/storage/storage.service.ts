import { AppService } from '../app/app.service';
import { ApiService } from '../api/api.service';

import {
  FileReaderResult,
  FileInfo,
  UploadFile,
  UploadResource,
  RenamePolicy,
  FileSharing,
  FileUpdateData,
} from './types';

export class StorageService {

  private Api: ApiService;

  app: AppService;

  constructor(app: AppService) {
    this.app = app;
    this.Api = this.app.Api
      .extend()
      .setEndpoint(this.app.options.storageEndpoint || 'storage');
  }

  private base64Parser(base64Value: string) {
    const [ header, body ] = base64Value.split(';base64,');
    const mimeType = header.replace('data:', '');
    const size = body.replace(/\=/g, '').length * 0.75; // bytes
    return { mimeType, size, base64Body: body };
  }

  private isValidType(mimeType: string) {
    const { storageAllowTypes: allowTypes } = this.app.options;
    return !allowTypes || allowTypes.indexOf(mimeType) > -1;
  }

  private isValidSize(sizeBytes: number) {
    const { storageMaxSize: maxSize } = this.app.options;
    const sizeMB = sizeBytes / 1000000;
    return !maxSize || maxSize === 0 || sizeMB <= maxSize;
  }

  private validateUploadFile(fileData: UploadFile) {
    let error: string;
    // check file data
    if (
      !fileData ||
      !fileData.base64Value ||
      !fileData.name
    ) {
      error = 'Missing upload data.';
    } else {
      const { mimeType, size } = this.base64Parser(fileData.base64Value);
      // check type and size
      if (!this.isValidType(mimeType)) {
        error = 'Invalid file type.';
      } else if (!this.isValidSize(size)) {
        error = 'Invalid file size.';
      }
    }
    // throw error
    if (!!error) {
      throw new Error(error);
    }
  }

  info(id: string): Promise<FileInfo> {
    return this.Api.get('/', { id });
  }

  upload(
    fileData: UploadFile,
    customFolder?: string,
    renamePolicy?: RenamePolicy,
    sharing: FileSharing = 'PRIVATE',
  ): Promise<FileInfo> {
    this.validateUploadFile(fileData);
    // build the request body
    const body: any = { file: fileData };
    if (customFolder) {
      body.folder = customFolder;
    }
    if (renamePolicy) {
      body.rename = renamePolicy;
    }
    if (sharing) {
      body.share = sharing;
    }
    return this.Api.put('/', {}, body);
  }

  uploadMultiple(uploadResources: UploadResource[]): Promise<FileInfo[]> {
    for (let i = 0; i < uploadResources.length; i++) {
      const { file: fileData } = uploadResources[i];
      this.validateUploadFile(fileData);
    }
    return this.Api.put('/', {}, { files: uploadResources });
  }

  update(id: string, data: FileUpdateData): Promise<{ done: true }> {
    return this.Api.post('/', {}, { id, data });
  }

  remove(id: string): Promise<{ done: true }> {
    return this.Api.delete('/', {}, { id });
  }

  read(_file: File): Promise<FileReaderResult> {
    return new Promise((resolve, reject) => {
      // check errors
      if (!this.isValidType(_file.type)) {
        return reject('Invalid file type.');
      }
      if (!this.isValidSize(_file.size)) {
        return reject('Invalid file size.');
      }
      // read the file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const { name, size, type: mimeType, lastModified  } = _file;
        const base64Value = e.target.result;
        resolve({ _file, name, size, mimeType, lastModified, base64Value });
      };
      reader.readAsDataURL(_file);
    });
  }

}