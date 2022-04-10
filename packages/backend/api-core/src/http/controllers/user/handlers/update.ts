/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getCustomRepository } from 'typeorm';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { PermissionID, isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { runUserValidation } from '../utils/validation';
import { UserRepository } from '../../../../domains';
import { CRUDOperation } from '../../../constants';

export async function updateUserRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        !req.ability.hasPermission(PermissionID.USER_EDIT) &&
        req.user.id !== id
    ) {
        throw new ForbiddenError('You are not authorized to modify a user.');
    }

    const result = await runUserValidation(req, CRUDOperation.UPDATE);
    if (!result.data) {
        return res.respondAccepted();
    }

    const repository = getCustomRepository<UserRepository>(UserRepository);

    if (result.data.password) {
        result.data.password = await repository.hashPassword(result.data.password);
    }

    let entity = await repository.findOne(id);
    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError(`You are not allowed to edit users of the realm ${entity.realm_id}`);
    }

    if (
        result.data.name &&
        result.data.name !== entity.name
    ) {
        if (result.data.name_locked) {
            entity.name_locked = result.data.name_locked;
        }

        if (entity.name_locked) {
            delete result.data.name;
        }
    }

    entity = repository.merge(entity, result.data);

    await repository.save(entity);

    return res.respond({
        data: entity,
    });
}
