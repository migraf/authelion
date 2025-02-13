/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    isPropertySet, isRealmResourceWritable,
} from '@authup/common';
import { check, validationResult } from 'express-validator';
import { BadRequestError } from '@ebec/http';
import { Request } from 'routup';
import { RealmEntity, ScopeEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils';
import {
    ExpressValidationResult,
    RequestValidationError,
    buildHTTPValidationErrorMessage,
    extendExpressValidationResultWithRelation,
    initExpressValidationResult,
    matchedValidationData,
} from '../../../validation';
import { CRUDOperation } from '../../../constants';

export async function runScopeValidation(
    req: Request,
    operation: `${CRUDOperation.CREATE}` | `${CRUDOperation.UPDATE}`,
) : Promise<ExpressValidationResult<ScopeEntity>> {
    const result : ExpressValidationResult<ScopeEntity> = initExpressValidationResult();

    const nameChain = await check('name')
        .exists()
        .isString()
        .notEmpty();

    if (operation === CRUDOperation.UPDATE) nameChain.optional();

    await nameChain.run(req);

    await check('description')
        .exists()
        .notEmpty()
        .isString()
        .isLength({ min: 5, max: 4096 })
        .optional({ nullable: true })
        .run(req);

    await check('realm_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    // ----------------------------------------------

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new RequestValidationError(validation);
    }

    result.data = matchedValidationData(req, { includeOptionals: true });

    // ----------------------------------------------

    await extendExpressValidationResultWithRelation(result, RealmEntity, {
        id: 'realm_id',
        entity: 'realm',
    });

    if (isPropertySet(result.data, 'realm_id')) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'), result.data.realm_id)) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('realm_id'));
        }
    } else if (
        operation === CRUDOperation.CREATE &&
        !isRealmResourceWritable(useRequestEnv(req, 'realm'))
    ) {
        throw new BadRequestError(buildHTTPValidationErrorMessage('realm_id'));
    }

    // ----------------------------------------------

    return result;
}
