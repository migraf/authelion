/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@ebec/http';
import { PermissionName } from '@authup/common';
import { Request, Response, sendCreated } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { UserRoleEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils/env';
import { runUserRoleValidation } from '../utils';
import { CRUDOperation } from '../../../constants';

export async function createUserRoleRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionName.USER_ROLE_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runUserRoleValidation(req, CRUDOperation.CREATE);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(UserRoleEntity);
    let entity = repository.create(result.data);

    entity = await repository.save(entity);

    return sendCreated(res, entity);
}
