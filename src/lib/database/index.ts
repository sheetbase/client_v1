import { Options } from '../types';
import { DatabaseService } from './database.service';

export function database(options: Options) {
    return new DatabaseService(options);
}
