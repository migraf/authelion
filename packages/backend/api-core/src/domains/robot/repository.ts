/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityRepository, Repository } from 'typeorm';
import {
    PermissionMeta, Robot,
    Role, buildPermissionMetaFromRelation, createNanoID,
} from '@authelion/common';

import { compare, hash } from '@authelion/api-utils';
import { RoleRepository } from '../role';
import { RobotEntity } from './entity';
import { RobotRoleEntity } from '../robot-role';
import { RobotPermissionEntity } from '../robot-permission';

@EntityRepository(RobotEntity)
export class RobotRepository extends Repository<RobotEntity> {
    async getOwnedPermissions(
        id: Robot['id'],
    ) : Promise<PermissionMeta[]> {
        let permissions : PermissionMeta[] = await this.getSelfOwnedPermissions(id);

        const roles = await this.manager
            .getRepository(RobotRoleEntity)
            .find({
                robot_id: id,
            });

        const roleIds: Role['id'][] = roles.map((userRole) => userRole.role_id);

        if (roleIds.length === 0) {
            return permissions;
        }

        const roleRepository = this.manager.getCustomRepository<RoleRepository>(RoleRepository);
        permissions = [...permissions, ...await roleRepository.getOwnedPermissions(roleIds)];

        return permissions;
    }

    async getSelfOwnedPermissions(id: string) : Promise<PermissionMeta[]> {
        const repository = this.manager.getRepository(RobotPermissionEntity);

        const entities = await repository.find({
            robot_id: id,
        });

        const result : PermissionMeta[] = [];
        for (let i = 0; i < entities.length; i++) {
            result.push(buildPermissionMetaFromRelation(entities[i]));
        }

        return result;
    }

    /**
     * Verify a client by id and secret.
     *
     * @param id
     * @param secret
     */
    async verifyCredentials(id: string, secret: string) : Promise<RobotEntity | undefined> {
        const entity = await this.createQueryBuilder('robot')
            .addSelect('robot.secret')
            .where('robot.id = :id', { id })
            .getOne();

        if (
            !entity ||
            !entity.secret
        ) {
            return undefined;
        }

        const verified = await compare(secret, entity.secret);
        if (!verified) {
            return undefined;
        }

        return entity;
    }

    async createWithSecret(data: Partial<Robot>) : Promise<{
        entity: RobotEntity,
        secret: string
    }> {
        const entity = this.create(data);

        const secret = entity.secret || createNanoID(undefined, 64);
        entity.secret = await this.hashSecret(secret);

        return {
            entity,
            secret,
        };
    }

    async hashSecret(secret: string) : Promise<string> {
        return hash(secret);
    }
}
