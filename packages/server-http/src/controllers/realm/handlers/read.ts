/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUUID } from '@authup/common';
import { useRequestQuery } from '@routup/query';
import {
    Request, Response, send, useRequestParam,
} from 'routup';
import {
    applyQuery, useDataSource,
} from 'typeorm-extension';
import { BadRequestError, NotFoundError } from '@ebec/http';
import { RealmEntity } from '@authup/server-database';

export async function getManyRealmRouteHandler(
    req: Request,
    res: Response,
) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RealmEntity);

    const query = repository.createQueryBuilder('realm');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'realm',
        filters: {
            allowed: ['id', 'name'],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['id', 'name', 'created_at', 'updated_at'],
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

export async function getOneRealmRouteHandler(
    req: Request,
    res: Response,
) : Promise<any> {
    const id = useRequestParam(req, 'id');

    if (typeof id !== 'string') {
        throw new BadRequestError();
    }

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RealmEntity);

    const query = repository.createQueryBuilder('realm');
    if (isUUID(id)) {
        query.where('realm.id = :id', { id });
    } else {
        query.where('realm.name LIKE :name', { name: id });
    }

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}
