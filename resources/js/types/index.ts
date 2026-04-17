import { Auth } from './auth';

export type * from './auth';
export type * from './navigation';
export type * from './ui';

export type SharedData = {
    name: string;
    auth: Auth;
    [key: string]: unknown;
};
