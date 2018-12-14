import { Options } from './types';
import { Apps } from './app';

export const APPS = new Apps();

export function initializeApp(options: Options, name?: string) {
    return APPS.createApp(options, name);
}