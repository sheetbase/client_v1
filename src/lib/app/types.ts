import { ApiOptions } from '../api/types';
import { AuthOptions } from '../auth/types';
import { DatabaseOptions } from '../database/types';
import { StorageOptions } from '../storage/types';
import { MailOptions } from '../mail/types';

export interface AppOptions
extends ApiOptions, AuthOptions, DatabaseOptions, StorageOptions, MailOptions {}
export { AppOptions as Options };

export interface PopupConfigs {
  url: string;
  name?: string;
  options?: string;
  callback?: () => any;
}