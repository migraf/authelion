/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Permission } from '../permission';
import { Role } from '../role';

@Entity({ name: 'auth_role_permissions' })
@Index(['permission_id', 'role_id'], { unique: true })
export class RolePermission {
    @PrimaryGeneratedColumn({ unsigned: true })
        id: number;

    @Column({ type: 'int', default: 999 })
        power: number;

    @Column({ type: 'text', nullable: true, default: null })
        condition: any | null;

    @Column({ type: 'text', nullable: true, default: null })
        fields: string[] | null;

    @Column({ type: 'boolean', default: false })
        negation: boolean;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ unsigned: true })
        role_id: number;

    @ManyToOne(() => Role, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
        role: Role;

    @Column({ type: 'varchar' })
        permission_id: string;

    @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permission_id' })
        permission: Permission;
}