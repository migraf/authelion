/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';

import { PermissionName, isRealmResourceWritable } from '@authup/common';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { RoleAttributeEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils/env';
import { runRoleAttributeValidation } from '../utils';
import { CRUDOperation } from '../../../constants';

export async function updateRoleAttributeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const result = await runRoleAttributeValidation(req, CRUDOperation.UPDATE);
    if (!result) {
        return sendAccepted(res);
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RoleAttributeEntity);

    let entity = await repository.findOneBy({ id });
    if (!entity) {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, result.data);

    const ability = useRequestEnv(req, 'ability');
    if (
        !ability.has(PermissionName.ROLE_EDIT) ||
        !isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)
    ) {
        throw new ForbiddenError('You are not permitted to update an attribute for this role...');
    }

    await repository.save(entity);

    return sendAccepted(res, entity);
}
