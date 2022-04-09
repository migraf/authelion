/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Brackets, getRepository } from 'typeorm';
import { applyFilters, applyPagination, applySort } from 'typeorm-extension';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { RoleAttributeEntity, onlyRealmPermittedQueryResources } from '../../../../domains';

export async function getManyRoleAttributeRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page, sort } = req.query;
    const repository = getRepository(RoleAttributeEntity);

    const query = repository.createQueryBuilder('roleAttribute');

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFilters(query, filter, {
        defaultAlias: 'roleAttribute',
        allowed: ['id', 'key', 'role_id', 'realm_id'],
    });

    applySort(query, sort, {
        defaultAlias: 'roleAttribute',
        allowed: ['id', 'key', 'role_id', 'realm_id', 'created_at', 'updated_at'],
    });

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}

export async function getOneRoleAttributeRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
) : Promise<any> {
    const { id } = req.params;

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const repository = getRepository(RoleAttributeEntity);

    const result = await repository.findOne(id);

    if (typeof result === 'undefined') {
        throw new NotFoundError();
    }

    if (
        !isPermittedForResourceRealm(req.realmId, result.realm_id)
    ) {
        throw new ForbiddenError('You are not authorized to read this role attribute...');
    }

    return res.respond({
        data: result,
    });
}