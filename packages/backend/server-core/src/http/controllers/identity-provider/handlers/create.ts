/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError } from '@typescript-error/http';
import {
    PermissionID,
} from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { runOauth2ProviderValidation } from '../utils';
import { IdentityProviderRepository } from '../../../../domains';
import { CRUDOperation } from '../../../constants';
import { useDataSource } from '../../../../database';

export async function createIdentityProviderRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.has(PermissionID.PROVIDER_ADD)) {
        throw new ForbiddenError();
    }

    const result = await runOauth2ProviderValidation(req, CRUDOperation.CREATE);

    const dataSource = await useDataSource();
    const repository = new IdentityProviderRepository(dataSource);

    const entity = repository.create(result.data);

    await repository.save(entity);

    await repository.saveAttributes(entity.id, result.attributes);
    repository.appendAttributes(entity, result.attributes);

    return res.respond({
        data: entity,
    });
}