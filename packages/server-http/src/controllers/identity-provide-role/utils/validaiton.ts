/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { isRealmResourceWritable } from '@authup/common';
import { BadRequestError } from '@ebec/http';
import { Request } from 'routup';
import { IdentityProviderEntity, IdentityProviderRoleEntity, RoleEntity } from '@authup/server-database';
import { CRUDOperation } from '../../../constants';
import { useRequestEnv } from '../../../utils/env';
import {
    ExpressValidationResult,
    RequestValidationError,
    buildHTTPValidationErrorMessage,
    extendExpressValidationResultWithRelation,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../validation';

export async function runIdentityProviderRoleValidation(
    req: Request,
    operation: `${CRUDOperation.CREATE}` | `${CRUDOperation.UPDATE}`,
) : Promise<ExpressValidationResult<IdentityProviderRoleEntity>> {
    const result : ExpressValidationResult<IdentityProviderRoleEntity> = initExpressValidationResult();

    if (operation === CRUDOperation.CREATE) {
        await check('provider_id')
            .exists()
            .isUUID()
            .run(req);

        await check('role_id')
            .exists()
            .isUUID()
            .run(req);
    }

    const externalPromise = await check('external_id')
        .exists()
        .isLength({ min: 3, max: 36 });

    if (operation === CRUDOperation.UPDATE) externalPromise.optional();

    await externalPromise.run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithRelation(result, RoleEntity, {
        id: 'role_id',
        entity: 'role',
    });

    if (
        result.relation.role &&
        result.relation.role.realm_id
    ) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.role.realm_id)) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('role_id'));
        }

        result.data.role_realm_id = result.relation.role.realm_id;
    }

    await extendExpressValidationResultWithRelation(result, IdentityProviderEntity, {
        id: 'provider_id',
        entity: 'provider',
    });

    if (result.relation.provider) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.relation.provider.realm_id)) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('provider_id'));
        }

        result.data.provider_realm_id = result.relation.provider.realm_id;
    }

    return result;
}
