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
import { RoleEntity } from '@authup/server-database';
import { findRealm } from '../../../helpers';

export async function getManyRoleRouteHandler(req: Request, res: Response) : Promise<any> {
    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RoleEntity);
    const query = repository.createQueryBuilder('role');

    const { pagination } = applyQuery(query, useRequestQuery(req), {
        defaultAlias: 'role',
        fields: {
            allowed: [
                'id',
                'name',
                'target',
                'description',
                'realm_id',
                'created_at',
                'updated_at',
            ],
        },
        filters: {
            allowed: ['id', 'name', 'target', 'realm_id'],
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

export async function getOneRoleRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const fields = useRequestQuery(req, 'fields');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RoleEntity);
    const query = repository.createQueryBuilder('role');

    if (isUUID(id)) {
        query.where('role.id = :id', { id });
    } else {
        query.where('role.name LIKE :name', { name: id });

        const realm = await findRealm(useRequestParam(req, 'realmId'));
        if (realm) {
            query.andWhere('role.realm_id = :realmId', { realmId: realm.id });
        }
    }

    applyFields(query, fields, {
        defaultAlias: 'role',
        allowed: [
            'id',
            'name',
            'target',
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
