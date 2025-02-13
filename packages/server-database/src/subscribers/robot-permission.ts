/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EntitySubscriberInterface,
    EventSubscriber, InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { buildKeyPath } from 'redis-extension';
import { RobotPermissionEntity } from '../domains';
import { CachePrefix } from '../constants';

@EventSubscriber()
export class RobotPermissionSubscriber implements EntitySubscriberInterface<RobotPermissionEntity> {
    // eslint-disable-next-line @typescript-eslint/ban-types
    listenTo(): Function | string {
        return RobotPermissionEntity;
    }

    async afterInsert(event: InsertEvent<RobotPermissionEntity>): Promise<any> {
        if (event.connection.queryResultCache) {
            await event.connection.queryResultCache.remove([
                buildKeyPath({
                    prefix: CachePrefix.ROBOT_OWNED_PERMISSIONS,
                    id: event.entity.robot_id,
                }),
            ]);
        }

        return Promise.resolve(undefined);
    }

    async afterUpdate(event: UpdateEvent<RobotPermissionEntity>): Promise<any> {
        if (!event.entity) {
            return;
        }

        if (event.connection.queryResultCache) {
            await event.connection.queryResultCache.remove([
                buildKeyPath({
                    prefix: CachePrefix.ROBOT_OWNED_PERMISSIONS,
                    id: event.entity.robot_id,
                }),
            ]);
        }
    }

    async afterRemove(event: RemoveEvent<RobotPermissionEntity>): Promise<any> {
        if (!event.entity) {
            return;
        }

        if (event.connection.queryResultCache) {
            await event.connection.queryResultCache.remove([
                buildKeyPath({
                    prefix: CachePrefix.ROBOT_OWNED_PERMISSIONS,
                    id: event.entity.robot_id,
                }),
            ]);
        }
    }
}
