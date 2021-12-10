/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export class AuthorizationHeaderError extends Error {
    public code = 'invalid_header';

    constructor(message: string, code?: string) {
        super(message);

        if (typeof code === 'string') {
            this.code = code;
        }
    }

    /* istanbul ignore next */
    static parse() {
        throw new AuthorizationHeaderError('The authorization header value could not be parsed.');
    }

    /* istanbul ignore next */
    static parseType() {
        throw new AuthorizationHeaderError('The authorization header value type must either be \'Bearer\' or \'Basic\'');
    }
}
