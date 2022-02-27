/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { ForbiddenError } from '@typescript-error/http';
import { check, matchedData, validationResult } from 'express-validator';
import { PermissionID, UserPermission } from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { ExpressValidationError } from '../../../express-validation';
import { UserPermissionEntity } from '../../../../domains';

/**
 * Add an permission by id to a specific user.
 *
 * @param req
 * @param res
 */
export async function createUserPermissionRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    await check('user_id')
        .exists()
        .isUUID()
        .run(req);

    await check('permission_id')
        .exists()
        .notEmpty()
        .isString()
        .run(req);

    if (!req.ability.hasPermission(PermissionID.USER_PERMISSION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserPermissionEntity);
    let rolePermission = repository.create(data);

    rolePermission = await repository.save(rolePermission);

    return res.respondCreated({
        data: rolePermission,
    });
}