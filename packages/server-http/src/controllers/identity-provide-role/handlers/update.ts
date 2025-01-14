/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    PermissionName, isRealmResourceWritable,
} from '@authup/common';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { IdentityProviderRoleEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils/env';
import { runIdentityProviderRoleValidation } from '../utils';
import { CRUDOperation } from '../../../constants';

export async function updateOauth2ProviderRoleRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionName.PROVIDER_EDIT)) {
        throw new ForbiddenError();
    }

    const result = await runIdentityProviderRoleValidation(req, CRUDOperation.UPDATE);
    if (!result.data) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(IdentityProviderRoleEntity);

    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    if (
        !isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.provider_realm_id) ||
        !isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.role_realm_id)
    ) {
        throw new ForbiddenError();
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return sendAccepted(res, entity);
}
