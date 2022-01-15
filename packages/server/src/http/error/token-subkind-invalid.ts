/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@typescript-error/http';

export class TokenSubKindInvalidError extends BadRequestError {
    constructor() {
        super({
            code: 'TOKEN_SUB_KIND_INVALID',
        });
    }
}