import { ApiOptions } from '../api/types';
import { DatabaseOptions } from '../database/types';
import { AuthOptions } from '../auth/types';
import { StorageOptions } from '../storage/types';
import { MailOptions } from '../mail/types';

export interface AppOptions extends ApiOptions, DatabaseOptions, AuthOptions, StorageOptions, MailOptions {}
export { AppOptions as Options };