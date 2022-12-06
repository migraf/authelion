/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@ebec/http';
import {
    PermissionID,
} from '@authup/common';
import {
    Request, Response, sendCreated,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { OAuth2ClientEntity } from '@authup/server-database';
import { useRequestEnv } from '../../../utils/env';
import { runOauth2ClientValidation } from '../utils';
import { CRUDOperation } from '../../../constants';

export async function createClientRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');
    if (!ability.has(PermissionID.CLIENT_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runOauth2ClientValidation(req, CRUDOperation.CREATE);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(OAuth2ClientEntity);

    const provider = repository.create(result.data);

    await repository.save(provider);

    return sendCreated(res, provider);
}