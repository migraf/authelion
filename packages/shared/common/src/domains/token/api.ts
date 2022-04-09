/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ClientDriverInstance } from '@trapi/client';
import { nullifyEmptyObjectProperties } from '../../utils';
import { TokenGrantPayload, TokenVerificationPayload } from './type';
import { SingleResourceResponse } from '../type';
import { OAuth2TokenResponse } from '../oauth2';

export class TokenAPI {
    protected client: ClientDriverInstance;

    constructor(client: ClientDriverInstance) {
        this.client = client;
    }

    async verify(token: string): Promise<SingleResourceResponse<TokenVerificationPayload>> {
        const response = await this.client.get(`token/${token}`);

        return response.data;
    }

    async delete(): Promise<void> {
        const response = await this.client.delete('token');

        return response.data;
    }

    async create(data: TokenGrantPayload): Promise<SingleResourceResponse<OAuth2TokenResponse>> {
        const response = await this.client.post('token', nullifyEmptyObjectProperties(data));

        return response.data;
    }
}