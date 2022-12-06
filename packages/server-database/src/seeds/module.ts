/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import {
    MASTER_REALM_ID,
    Permission,
    PermissionID,
    Robot,
    RobotPermission,
    RolePermission,
    UserRole,
    createNanoID,
} from '@authup/common';
import { Config, hasOwnProperty, hash } from '@authup/server-common';
import {
    PermissionEntity,
    RealmEntity,
    RobotEntity,
    RobotPermissionEntity,
    RoleEntity,
    RolePermissionEntity,
    UserRepository,
    UserRoleEntity,
    useRobotEventEmitter,
} from '../domains';
import { Options, OptionsInput, useConfig } from '../config';
import { DatabaseRootSeederResult } from './type';

function getPermissions(permissions?: string[]) {
    return Array.from(new Set([
        ...Object.values(PermissionID),
        ...(permissions || []),
    ]));
}

export class DatabaseSeeder implements Seeder {
    protected config: Config<Options, OptionsInput>;

    protected options: Partial<Options>;

    constructor(options?: Partial<Options>) {
        this.config = useConfig();
        this.options = options || {};
    }

    private getOption<K extends keyof Options>(key: K) : Options[K] {
        if (
            hasOwnProperty(this.options, key) &&
            typeof this.options[key] !== 'undefined'
        ) {
            return this.options[key] as Options[K];
        }

        return this.config.get(key);
    }

    public async run(dataSource: DataSource) : Promise<any> {
        const response : DatabaseRootSeederResult = {};

        /**
         * Create default realm
         */
        const realmRepository = dataSource.getRepository(RealmEntity);
        let realm = await realmRepository.findOneBy({
            name: MASTER_REALM_ID,
        });

        if (!realm) {
            realm = realmRepository.create({
                id: MASTER_REALM_ID,
                name: 'Master',
                drop_able: false,
            });
        }

        await realmRepository.save(realm);

        // -------------------------------------------------

        /**
         * Create default role
         */
        const roleRepository = dataSource.getRepository(RoleEntity);
        let role = await roleRepository.findOneBy({
            name: 'admin',
        });
        if (!role) {
            role = roleRepository.create({
                name: 'admin',
            });
        }

        await roleRepository.save(role);

        // -------------------------------------------------

        /**
         * Create default user
         */
        const userRepository = new UserRepository(dataSource);
        let user = await userRepository.findOneBy({
            name: this.getOption('adminUsername'),
        });

        if (!user) {
            user = userRepository.create({
                name: this.getOption('adminUsername'),
                password: await hash(this.getOption('adminPassword')),
                email: 'peter.placzek1996@gmail.com',
                realm_id: MASTER_REALM_ID,
                active: true,
            });

            response.user = user;
        } else if (this.getOption('adminPasswordReset')) {
            user.password = await hash(this.getOption('adminPassword'));
            user.active = true;
        }

        await userRepository.save(user);
        // -------------------------------------------------

        /**
         * Create default user - role association
         */
        const userRoleData : Partial<UserRole> = {
            role_id: role.id,
            user_id: user.id,
        };

        const userRoleRepository = dataSource.getRepository(UserRoleEntity);
        let userRole = await userRoleRepository.findOneBy(userRoleData as FindOptionsWhere<UserRole>);

        if (!userRole) {
            userRole = userRoleRepository.create(userRoleData);
        }

        await userRoleRepository.save(userRole);

        // -------------------------------------------------

        /**
         * Create all permissions
         */
        let permissionIds : string[] = getPermissions(this.getOption('permissions'));

        const permissionRepository = dataSource.getRepository(PermissionEntity);

        const existingPermissions = await permissionRepository.findBy({
            id: In(permissionIds),
        });

        for (let i = 0; i < existingPermissions.length; i++) {
            const index = permissionIds.indexOf(existingPermissions[i].id);
            if (index !== -1) {
                permissionIds.splice(index, 1);
            }
        }

        const permissions : Permission[] = permissionIds.map((id: string) => permissionRepository.create({ id }));
        if (permissions.length > 0) {
            await permissionRepository.save(permissions);
        }

        // -------------------------------------------------

        /**
         * Assign all permissions to default role.
         */
        permissionIds = getPermissions(this.getOption('permissions'));
        const rolePermissionRepository = dataSource.getRepository(RolePermissionEntity);

        const existingRolePermissions = await rolePermissionRepository.findBy({
            permission_id: In(permissionIds),
            role_id: role.id,
        });

        for (let i = 0; i < existingRolePermissions.length; i++) {
            const index = permissionIds.indexOf(existingRolePermissions[i].permission_id);
            if (index !== -1) {
                permissionIds.splice(index, 1);
            }
        }

        const rolePermissions : RolePermission[] = [];
        for (let j = 0; j < permissionIds.length; j++) {
            rolePermissions.push(rolePermissionRepository.create({
                role_id: role.id,
                permission_id: permissionIds[j],
            }));
        }

        if (rolePermissions.length > 0) {
            await rolePermissionRepository.save(rolePermissions);
        }

        // -------------------------------------------------

        /**
         * Create default robot account
         */
        const robotRepository = dataSource.getRepository<Robot>(RobotEntity);
        let robot = await robotRepository.findOneBy({
            name: 'SYSTEM',
        });

        const secret = this.getOption('robotSecret') || createNanoID(64);
        if (!robot) {
            robot = robotRepository.create({
                name: 'SYSTEM',
                realm_id: MASTER_REALM_ID,
                secret: await hash(secret),
            });

            await robotRepository.save(robot);

            robot.secret = secret;
            response.robot = robot;
        } else if (this.getOption('robotSecretReset')) {
            robot.secret = await hash(secret);

            await robotRepository.save(robot);

            robot.secret = secret;
            response.robot = robot;
        }

        useRobotEventEmitter()
            .emit('credentials', {
                ...robot,
                secret,
            });

        // -------------------------------------------------

        /**
         * Assign all permissions to default robot.
         */
        permissionIds = getPermissions(this.getOption('permissions'));
        const robotPermissionRepository = dataSource.getRepository(RobotPermissionEntity);

        const existingRobotPermissions = await robotPermissionRepository.findBy({
            permission_id: In(permissionIds),
            robot_id: robot.id,
        });

        for (let i = 0; i < existingRobotPermissions.length; i++) {
            const index = permissionIds.indexOf(existingRobotPermissions[i].permission_id);
            if (index !== -1) {
                permissionIds.splice(index, 1);
            }
        }

        const robotPermissions : RobotPermission[] = [];
        for (let j = 0; j < permissionIds.length; j++) {
            robotPermissions.push(robotPermissionRepository.create({
                robot_id: robot.id,
                permission_id: permissionIds[j],
            }));
        }

        if (robotPermissions.length > 0) {
            await robotPermissionRepository.save(robotPermissions);
        }

        return response;
    }
}