/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { sign, verify } from 'jsonwebtoken';
import { SecurityKeyPair, SecurityKeyPairOptions, useSecurityKeyPair } from '../key-pair';

export type SignedToken = {
    token: string,
    expiresIn: number
};

export async function createToken<T extends Record<string, any>>(
    payload: T,
    maxAge = 3600,
    keyPairOptions?: SecurityKeyPairOptions,
) : Promise<string> {
    const keyPair : SecurityKeyPair = await useSecurityKeyPair(keyPairOptions);

    return sign(payload, keyPair.privateKey, {
        expiresIn: maxAge,
        algorithm: 'RS256',
    });
}

export async function verifyToken<T extends Record<string, any>>(
    token: string,
    keyPairOptions?: SecurityKeyPairOptions,
) : Promise<T> {
    const keyPair : SecurityKeyPair = await useSecurityKeyPair(keyPairOptions);

    return await verify(token, keyPair.publicKey, {
        algorithms: ['RS256'],
    }) as T;
}
