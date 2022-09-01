/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { User } from '../user';
import { Client } from '../client';
import { Robot } from '../robot';
import { Realm } from '../realm';
import { OAuth2TokenGrant } from './constants';

export interface OAuth2AccessToken {
    id: string,

    content: string,

    client_id: Client['id'] | null,

    client: Client | null,

    user_id: User['id'] | null,

    user: User | null,

    robot_id: Robot['id'] | null,

    robot: Robot | null,

    realm_id: Realm['id'],

    realm: Realm,

    expires: Date | string,

    scope: string | null
}

export type OAuth2TokenGrantType = `${OAuth2TokenGrant}`;