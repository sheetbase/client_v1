import { Options } from '../types';
import { StorageService } from './storage.service';

export function storage(options: Options) {
    return new StorageService(options);
}

export function initializeApp(options: Options) {
    const Storage = storage(options);
    return { Storage, storage: () => Storage };
}
