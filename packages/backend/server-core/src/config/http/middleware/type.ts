/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type HTTPMiddlewareOptions = {
    bodyParser: boolean,
    cookieParser: boolean,
    response: boolean,
    swaggerEnabled: boolean,
    swaggerDirectoryPath: string
};

export type HTTPMiddlewareOptionsInput = Partial<HTTPMiddlewareOptions>;