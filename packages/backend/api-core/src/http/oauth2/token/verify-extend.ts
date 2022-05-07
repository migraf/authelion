/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Cache, useClient } from 'redis-extension';
import {
    OAuth2TokenSubKind,
    OAuth2TokenVerification, PermissionMeta, Robot,
    TokenError,
    TokenVerificationPayload,
    User,
} from '@authelion/common';
import { NotFoundError } from '@typescript-error/http';
import {
    RobotRepository, UserAttributeEntity, UserRepository, transformUserAttributes,
} from '../../../domains';
import { CachePrefix } from '../../../config/constants';
import { useDataSource } from '../../../database';
import { Config, useConfig } from '../../../config';

/**
 *
 * @param token
 * @param config
 *
 * @throws TokenError
 * @throws NotFoundError
 */
export async function extendOAuth2TokenVerification(
    token: OAuth2TokenVerification,
    config?: Config,
) {
    const data : TokenVerificationPayload = {
        ...token,
    };

    let cache: Cache<Robot['id'] | User['id']> | undefined;
    let permissionCache: Cache<Robot['id'] | User['id']> | undefined;

    config ??= await useConfig();
    if (config.redis.enabled) {
        const redis = useClient(config.redis.alias);

        cache = new Cache<Robot['id'] | User['id']>(
            { redis },
            { prefix: CachePrefix.TOKEN_TARGET, seconds: 60 },
        );

        permissionCache = new Cache<Robot['id'] | User['id']>(
            { redis },
            { prefix: CachePrefix.TOKEN_TARGET_PERMISSIONS, seconds: 60 },
        );
    }

    const dataSource = await useDataSource();

    switch (data.payload.sub_kind) {
        case OAuth2TokenSubKind.ROBOT: {
            const robotRepository = new RobotRepository(dataSource);

            let entity : Robot | undefined | null;
            if (cache) {
                entity = await cache.get(data.payload.sub);
            }

            if (!entity) {
                entity = await robotRepository.findOneBy({ id: data.payload.sub });

                if (!entity) {
                    throw new NotFoundError();
                }

                if (cache) {
                    await cache.set(entity.id, entity);
                }
            }

            if (!entity.active) {
                throw TokenError.targetInactive(OAuth2TokenSubKind.ROBOT);
            }

            let permissions : PermissionMeta[] | undefined;

            if (permissionCache) {
                permissions = await permissionCache.get(entity.id);
            }

            if (!permissions) {
                if (entity.user_id) {
                    const userRepository = new UserRepository(dataSource);
                    permissions = await userRepository.getOwnedPermissions(entity.user_id);
                } else {
                    permissions = await robotRepository.getOwnedPermissions(entity.id);
                }

                if (permissionCache) {
                    await permissionCache.set(entity.id, permissions);
                }
            }

            data.target = {
                kind: OAuth2TokenSubKind.ROBOT,
                entity,
                permissions: permissions || [],
            };
            break;
        }
        case OAuth2TokenSubKind.USER: {
            const userRepository = new UserRepository(dataSource);

            let entity : User | undefined | null;
            if (cache) {
                entity = await cache.get(data.payload.sub);
            }

            if (!entity) {
                const userQuery = userRepository.createQueryBuilder('user')
                    .addSelect('user.email')
                    .where('user.id = :id', { id: token.payload.sub });

                entity = await userQuery.getOne();

                if (!entity) {
                    throw new NotFoundError();
                }

                const userAttributeRepository = dataSource.getRepository(UserAttributeEntity);
                const userAttributes = await userAttributeRepository.findBy({
                    user_id: entity.id,
                });

                entity.extra = transformUserAttributes(userAttributes);

                if (cache) {
                    await cache.set(entity.id, entity);
                }
            }

            if (!entity.active) {
                throw TokenError.targetInactive(OAuth2TokenSubKind.USER);
            }

            let permissions : PermissionMeta[] | undefined;

            if (permissionCache) {
                permissions = await permissionCache.get(entity.id);
            }

            if (!permissions) {
                permissions = await userRepository.getOwnedPermissions(entity.id);
                if (permissionCache) {
                    await permissionCache.set(entity.id, permissions);
                }
            }

            data.target = {
                kind: OAuth2TokenSubKind.USER,
                entity,
                permissions: permissions || [],
            };
        }
    }

    return data;
}
