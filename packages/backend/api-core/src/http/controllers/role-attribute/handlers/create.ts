/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { ForbiddenError } from '@typescript-error/http';
import {
    PermissionID,
    isPermittedForResourceRealm,
} from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { runRoleAttributeValidation } from '../utils/validation';
import { RoleAttributeEntity } from '../../../../domains';
import { CRUDOperation } from '../../../constants';

export async function createRoleAttributeRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const result = await runRoleAttributeValidation(req, CRUDOperation.CREATE);
    if (!result) {
        return res.respondAccepted();
    }

    if (
        !req.ability.hasPermission(PermissionID.ROLE_EDIT) ||
        !isPermittedForResourceRealm(req.realmId, result.data.realm_id)
    ) {
        throw new ForbiddenError('You are not permitted to set an attribute for this role...');
    }

    const repository = getRepository(RoleAttributeEntity);

    const entity = repository.create(result.data);

    await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}
