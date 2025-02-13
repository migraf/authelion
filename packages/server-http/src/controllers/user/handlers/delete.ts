/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionName, isRealmResourceWritable } from '@authup/common';
import {
    Request, Response, sendAccepted, useRequestParam,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { UserRepository } from '@authup/server-database';
import { useRequestEnv } from '../../../utils';

export async function deleteUserRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionName.USER_DROP)) {
        throw new ForbiddenError('You are not authorized to drop a user.');
    }

    if (useRequestEnv(req, 'userId') === id) {
        throw new BadRequestError('The own user can not be deleted.');
    }

    const dataSource = await useDataSource();
    const repository = new UserRepository(dataSource);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), entity.realm_id)) {
        throw new ForbiddenError(`You are not authorized to drop a user fo the realm ${entity.realm_id}`);
    }

    const { id: entityId } = entity;

    await repository.remove(entity);

    entity.id = entityId;

    return sendAccepted(res, entity);
}
