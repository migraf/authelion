/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AbilityManager,
    AuthHeaderTypeUnsupported,
    CredentialsInvalidError,
    OAuth2TokenKind,
    OAuth2TokenSubKind,
    TokenError,
    User,
} from '@typescript-auth/domains';
import { getCustomRepository } from 'typeorm';
import { NotFoundError } from '@typescript-error/http';
import { AuthorizationHeader, AuthorizationHeaderType } from '@trapi/client';
import { ExpressRequest } from '../../../type';
import { UserRepository } from '../../../../domains';
import { verifyOAuth2Token } from '../../../oauth2';

export async function verifyUserForMiddlewareRequest(
    request: ExpressRequest,
    header: AuthorizationHeader,
    options: {
        writableDirectoryPath: string
    },
) : Promise<User> {
    const condition : Partial<User> = {};

    switch (header.type) {
        case AuthorizationHeaderType.BASIC: {
            condition.name = header.username;
            break;
        }
        case AuthorizationHeaderType.BEARER: {
            const token = await verifyOAuth2Token(
                header.token,
                {
                    keyPairOptions: {
                        directory: options.writableDirectoryPath,
                    },
                },
            );

            if (token.kind !== OAuth2TokenKind.ACCESS) {
                throw TokenError.accessTokenRequired();
            }

            if (token.payload.sub_kind === OAuth2TokenSubKind.USER) {
                condition.id = token.payload.sub as User['id'];
            } else {
                throw TokenError.subKindInvalid();
            }
            break;
        }
        default:
            throw new AuthHeaderTypeUnsupported(header.type);
    }

    const repository = getCustomRepository<UserRepository>(UserRepository);
    const entity = await repository.findOne({
        ...condition,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        header.type === AuthorizationHeaderType.BASIC &&
        !await repository.verifyCredentials(header.username, header.password)
    ) {
        throw new CredentialsInvalidError();
    }

    const permissions = await repository.getOwnedPermissions(entity.id);

    if (header.type === AuthorizationHeaderType.BEARER) {
        request.token = header.token;
    }

    request.user = entity;
    request.userId = entity.id;
    request.realmId = entity.realm_id;
    request.ability = new AbilityManager(permissions);

    return entity;
}
