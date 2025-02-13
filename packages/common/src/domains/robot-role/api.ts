/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput, buildQuery } from 'rapiq';
import { ClientDriverInstance } from 'hapic';
import { RobotRole } from './entity';
import {
    CollectionResourceResponse, DomainAPISlim, SingleResourceResponse,
} from '../type';

export class RobotRoleAPI implements DomainAPISlim<RobotRole> {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async getMany(data: BuildInput<RobotRole>): Promise<CollectionResourceResponse<RobotRole>> {
        const response = await this.client.get(`robot-roles${buildQuery(data)}`);

        return response.data;
    }

    async getOne(id: RobotRole['id']): Promise<SingleResourceResponse<RobotRole>> {
        const response = await this.client.get(`robot-roles/${id}`);

        return response.data;
    }

    async delete(id: RobotRole['id']): Promise<SingleResourceResponse<RobotRole>> {
        const response = await this.client.delete(`robot-roles/${id}`);

        return response.data;
    }

    async create(data: Partial<RobotRole>): Promise<SingleResourceResponse<RobotRole>> {
        const response = await this.client.post('robot-roles', data);

        return response.data;
    }
}
