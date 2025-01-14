/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { OAuth2TokenKind, OAuth2TokenPayload } from '@authup/common';
import { randomUUID } from 'node:crypto';
import { OAuth2AccessTokenBuildContext } from './type';

export function buildOAuth2AccessTokenPayload(
    context: OAuth2AccessTokenBuildContext,
) : Partial<OAuth2TokenPayload> {
    return {
        kind: OAuth2TokenKind.ACCESS,
        jti: randomUUID(),
        iss: context.issuer,
        sub: context.sub,
        sub_kind: context.subKind,
        remote_address: context.remoteAddress,
        aud: context.clientId,
        client_id: context.clientId,
        realm_id: context.realmId,
        realm_name: context.realmName,
        ...(context.scope ? { scope: context.scope } : {}),
    };
}
