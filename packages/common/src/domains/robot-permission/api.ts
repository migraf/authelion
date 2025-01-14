/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from 'rapiq';
import { ClientDriverInstance } from 'hapic';
import { RobotPermission } from './entity';
import {
    CollectionResourceResponse, DomainAPISlim, SingleResourceResponse,
} from '../type';

export class RobotPermissionAPI implements DomainAPISlim<RobotPermission> {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(data?: BuildInput<RobotPermission>) : Promise<CollectionResourceResponse<RobotPermission>> {
        const response = await this.client.get(`robot-permissions${buildQuery(data)}`);
        return response.data;
    }

    async getOne(id: RobotPermission['id'], data?: BuildInput<RobotPermission>) : Promise<SingleResourceResponse<RobotPermission>> {
        const response = await this.client.get(`robot-permissions/${id}${buildQuery(data)}`);

        return response.data;
    }

    async delete(id: RobotPermission['id']) : Promise<SingleResourceResponse<RobotPermission>> {
        const response = await this.client.delete(`robot-permissions/${id}`);

        return response.data;
    }

    async create(data: Partial<RobotPermission>) : Promise<SingleResourceResponse<RobotPermission>> {
        const response = await this.client.post('robot-permissions', data);

        return response.data;
    }
}
