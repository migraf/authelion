/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Request, setRequestEnv as setEnv, useRequestEnv as useEnv } from 'routup';
import { RequestEnv } from '../type';

export function useRequestEnv(req: Request) : RequestEnv;
export function useRequestEnv<T extends keyof RequestEnv>(req: Request, key: T) : RequestEnv[T];
export function useRequestEnv<T extends keyof RequestEnv>(req: Request, key?: T) {
    if (typeof key === 'string') {
        return useEnv(req, key) as RequestEnv[T];
    }

    return useEnv(req);
}

export function setRequestEnv<T extends keyof RequestEnv>(req: Request, key: T, value: RequestEnv[T]) {
    return setEnv(req, key, value);
}
