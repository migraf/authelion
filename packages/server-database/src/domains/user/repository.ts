/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DataSource,
    EntityManager, FindOptionsWhere,
    In,
    InstanceChecker,
    Repository,
} from 'typeorm';
import {
    AbilityDescriptor,
    Role, User,
    UserRole,
    buildPermissionDescriptorFromRelation,
    createNanoID,
} from '@authup/common';

import { compare, hash } from '@authup/server-common';
import { buildKeyPath } from 'redis-extension';
import { RoleRepository } from '../role';
import { UserRoleEntity } from '../user-role';
import { UserPermissionEntity } from '../user-permission';
import { UserEntity } from './entity';
import { CachePrefix } from '../../constants';
import { UserAttributeEntity } from '../user-attribute';
import { appendAttributes, transformAttributesToRecord } from '../utils';

export class UserRepository extends Repository<UserEntity> {
    constructor(instance: DataSource | EntityManager) {
        super(UserEntity, InstanceChecker.isDataSource(instance) ? instance.manager : instance);
    }

    async appendAttributes(
        entity: Partial<Omit<User, 'id'> & Pick<User, 'id'>>,
        names?: string[],
    ) : Promise<Partial<User>> {
        const attributeRepository = this.manager.getRepository(UserAttributeEntity);
        const where : FindOptionsWhere<UserAttributeEntity> = {
            user_id: entity.id,
        };

        if (names) {
            where.name = In(names);
        }

        const rawAttributes = await attributeRepository.find({
            where: {
                user_id: entity.id,
            },
            cache: {
                id: buildKeyPath({
                    prefix: CachePrefix.USER_OWNED_ATTRIBUTES,
                    id: entity.id,
                }),
                milliseconds: 60.000,
            },
        });

        const attributes = transformAttributesToRecord(rawAttributes);
        appendAttributes(entity, attributes);

        return entity;
    }

    async syncRoles(
        userId: User['id'],
        roleIds: Role['id'][],
    ) {
        const userRoleRepository = this.manager.getRepository(UserRoleEntity);

        const userRoles = await userRoleRepository.createQueryBuilder('userRole')
            .where('userRole.user_id = :userId', { userId })
            .getMany();

        const userRoleIdsToDrop : UserRole['id'][] = userRoles
            .filter((userRole: UserRole) => roleIds.indexOf(userRole.role_id) === -1)
            .map((userRole: UserRole) => userRole.id);

        if (userRoleIdsToDrop.length > 0) {
            await userRoleRepository.delete({
                id: In(userRoleIdsToDrop),
            });
        }

        const userRolesToAdd : Partial<UserRole>[] = roleIds
            .filter((roleId) => userRoles.findIndex((userRole: UserRole) => userRole.role_id === roleId) === -1)
            .map((roleId) => userRoleRepository.create({ role_id: roleId, user_id: userId }));

        if (userRolesToAdd.length > 0) {
            await userRoleRepository.insert(userRolesToAdd);
        }
    }

    // ------------------------------------------------------------------

    async getOwnedPermissions(
        id: User['id'],
    ) : Promise<AbilityDescriptor[]> {
        const permissions : AbilityDescriptor[] = await this.getSelfOwnedPermissions(id);

        const roles = await this.manager
            .getRepository(UserRoleEntity)
            .find({
                where: {
                    user_id: id,
                },
                cache: {
                    id: buildKeyPath({
                        prefix: CachePrefix.USER_OWNED_ROLES,
                        id,
                    }),
                    milliseconds: 60.000,
                },
            });

        const roleIds: Role['id'][] = roles.map((userRole) => userRole.role_id);

        if (roleIds.length === 0) {
            return permissions;
        }

        const roleRepository = new RoleRepository(this.manager);
        permissions.push(...await roleRepository.getOwnedPermissionsByMany(roleIds));

        return permissions;
    }

    async getSelfOwnedPermissions(id: string) : Promise<AbilityDescriptor[]> {
        const repository = this.manager.getRepository(UserPermissionEntity);

        const entities = await repository.find({
            where: {
                user_id: id,
            },
            relations: {
                permission: true,
            },
            cache: {
                id: buildKeyPath({
                    prefix: CachePrefix.USER_OWNED_PERMISSIONS,
                    id,
                }),
                milliseconds: 60.000,
            },
        });

        const result : AbilityDescriptor[] = [];
        for (let i = 0; i < entities.length; i++) {
            result.push(buildPermissionDescriptorFromRelation(entities[i]));
        }

        return result;
    }

    // ------------------------------------------------------------------

    /**
     * Verify a user by name and password.
     *
     * @param name
     * @param password
     * @param realmId
     */
    async verifyCredentials(
        name: string,
        password: string,
        realmId?: string,
    ) : Promise<UserEntity | undefined> {
        const query = this.createQueryBuilder('user')
            .leftJoinAndSelect('user.realm', 'realm')
            .where('user.name LIKE :name', { name });

        if (realmId) {
            query.andWhere('user.realm_id = :realmId', { realmId });
        }

        const entities = await query
            .addSelect('user.password')
            .getMany();

        for (let i = 0; i < entities.length; i++) {
            if (!entities[i].password) {
                continue;
            }

            const verified = await compare(password, entities[i].password);
            if (verified) {
                return entities[i];
            }
        }

        return undefined;
    }

    async createWithPassword(data: Partial<User>) : Promise<{
        entity: UserEntity,
        password: string
    }> {
        const entity = this.create(data);

        const password = entity.password || createNanoID(64);
        entity.password = await this.hashPassword(password);

        return {
            entity,
            password,
        };
    }

    async hashPassword(password: string) : Promise<string> {
        return hash(password);
    }
}
