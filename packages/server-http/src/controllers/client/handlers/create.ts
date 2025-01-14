/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError } from '@ebec/http';
import {
    PermissionName, isPropertySet,
    isRealmResourceWritable,
} from '@authup/common';
import {
    Request, Response, sendCreated,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { ClientEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils';
import { buildHTTPValidationErrorMessage } from '../../../validation';
import { runOauth2ClientValidation } from '../utils';
import { CRUDOperation } from '../../../constants';

export async function createClientRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionName.CLIENT_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runOauth2ClientValidation(req, CRUDOperation.CREATE);

    if (!isPropertySet(result.data, 'realm_id')) {
        if (!isRealmResourceWritable(useRequestEnv(req, 'realm'))) {
            throw new BadRequestError(buildHTTPValidationErrorMessage('realm_id'));
        }
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ClientEntity);

    const provider = repository.create(result.data);

    await repository.save(provider);

    return sendCreated(res, provider);
}
