/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery, useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { ClientScopeEntity } from '@authup/server-database';

export async function getManyClientScopeRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ClientScopeEntity);
    const query = await repository.createQueryBuilder('clientScope');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'clientScope',
        relations: {
            allowed: ['client', 'scope'],
        },
        filters: {
            allowed: ['client_id', 'scope_id', 'default', 'scope.name'],
        },
        pagination: {
            maxLimit: 50,
        },
    });

    const [entities, total] = await query.getManyAndCount();

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}

export async function getOneClientScopeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ClientScopeEntity);
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}
