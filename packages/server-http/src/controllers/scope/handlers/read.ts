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
    applyFields,
    applyQuery,
    useDataSource,
} from 'typeorm-extension';
import { NotFoundError } from '@ebec/http';
import { ScopeEntity } from '@authup/server-database';
import { findRealm } from '../../../helpers';

export async function getManyScopeRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ScopeEntity);
    const query = repository.createQueryBuilder('scope');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'scope',
        fields: {
            allowed: [
                'id',
                'built_in',
                'name',
                'description',
                'realm_id',
                'created_at',
                'updated_at',
            ],
        },
        filters: {
            allowed: ['id', 'built_in', 'name', 'realm_id'],
        },
        pagination: {
            maxLimit: 50,
        },
        sort: {
            allowed: ['id', 'name', 'updated_at', 'created_at'],
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

export async function getOneScopeRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const fields = useRequestQuery(req, 'fields');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(ScopeEntity);
    const query = repository.createQueryBuilder('scope');

    if (isUUID(id)) {
        query.where('scope.id = :id', { id });
    } else {
        query.where('scope.name LIKE :name', { name: id });

        const realm = await findRealm(useRequestParam(req, 'realmId'));
        if (realm) {
            query.andWhere('scope.realm_id = :realmId', { realmId: realm.id });
        }
    }

    applyFields(query, fields, {
        defaultAlias: 'scope',
        allowed: [
            'id',
            'built_in',
            'name',
            'description',
            'realm_id',
            'created_at',
            'updated_at',
        ],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}
