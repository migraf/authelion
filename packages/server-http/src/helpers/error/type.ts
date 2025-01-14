/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ErrorResponsePayload = {
    code: string,
    message: string,
    statusCode: number,

    [key: string]: any
};
