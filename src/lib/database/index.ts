import { Options } from '../types';
import { DatabaseService } from './database.service';

export function database(options: Options) {
    return new DatabaseService(options);
}

export function initializeApp(options: Options) {
    const Database = database(options);
    return { Database, database: () => Database };
}
