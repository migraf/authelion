/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AccessTokenPayload, Oauth2TokenResponse, PermissionItem } from '@typescript-auth/core';
import { User } from '../user';
import { Client } from '../client';
import { TokenGrant } from './constants';

export {
    AccessTokenPayload,
    Oauth2TokenResponse,
};

export type TokenPayload = Partial<AccessTokenPayload> & {
    /**
     * remote address
     */
    remoteAddress: string,

    /**
     * iss type
     */
    type: 'user' | 'client',

    /**
     * Issued at (readonly)
     */
    iat?: number,

    /**
     * Expire at (readonly)
     */
    exp?: number
};

type TokenTargetUser = {
    type: 'user',
    data: Partial<User> & {
        permissions: PermissionItem<any>[]
    }
};

type TokenTargetClient = {
    type: 'client',
    data: Partial<Client> & {
        permissions: PermissionItem<any>[]
    }
};

export type TokenVerificationPayload = {
    token: TokenPayload,
    target: TokenTargetUser | TokenTargetClient
};

export type TokenGrantPayload = {
    username: string,
    password: string
};

export type TokenGrantType = `${TokenGrant}`;