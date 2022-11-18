/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID,
} from '@authelion/common';
import {
    Request, Response, send, sendCreated,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../utils';
import { runRobotValidation } from '../utils';
import {
    RobotRepository, useRobotEventEmitter,
} from '../../../../domains';
import { CRUDOperation } from '../../../constants';

export async function createRobotRouteHandler(req: Request, res: Response) : Promise<any> {
    const result = await runRobotValidation(req, CRUDOperation.CREATE);

    const ability = useRequestEnv(req, 'ability');
    const userId = useRequestEnv(req, 'userId');

    if (!ability.has(PermissionID.ROBOT_ADD)) {
        result.data.user_id = userId;
    } else if (
        result.data.user_id &&
        result.data.user_id !== userId
    ) {
        result.data.user_id = userId;
    }

    const dataSource = await useDataSource();
    const repository = new RobotRepository(dataSource);
    const { entity, secret } = await repository.createWithSecret(result.data);

    await repository.save(entity);

    entity.secret = secret;

    useRobotEventEmitter()
        .emit('credentials', {
            ...entity,
            secret,
        });

    useRobotEventEmitter()
        .emit('created', {
            ...entity,
        });

    return sendCreated(res, entity);
}