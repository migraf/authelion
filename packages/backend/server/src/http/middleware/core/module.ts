/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { parseAuthorizationHeader, stringifyAuthorizationHeader } from '@trapi/client';
import { CookieName } from '@typescript-auth/domains';
import path from 'path';
import { ExpressNextFunction, ExpressRequest, ExpressResponse } from '../../type';
import { AuthMiddlewareOptions } from './type';
import { verifyAuthorizationHeader } from './verify';

function parseRequestAccessTokenCookie(request: ExpressRequest): string | undefined {
    return typeof request.cookies?.[CookieName.ACCESS_TOKEN] === 'string' ?
        request.cookies?.[CookieName.ACCESS_TOKEN] :
        undefined;
}

export function createMiddleware(context: AuthMiddlewareOptions) {
    return async (request: ExpressRequest, response: ExpressResponse, next: ExpressNextFunction) => {
        let { authorization: headerValue } = request.headers;

        try {
            const cookie = parseRequestAccessTokenCookie(request);

            if (cookie) {
                headerValue = stringifyAuthorizationHeader({ type: 'Bearer', token: cookie });
            }

            if (typeof headerValue !== 'string') {
                next();
                return;
            }

            const header = parseAuthorizationHeader(headerValue);

            const writableDirectoryPath = context.writableDirectoryPath || path.join(process.cwd(), 'writable');

            await verifyAuthorizationHeader(request, header, {
                writableDirectoryPath,
                redis: context.redis,
            });

            next();
        } catch (e) {
            next(e);
        }
    };
}