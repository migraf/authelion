/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    OAuth2Scope, OAuth2SubKind, OAuth2TokenGrantResponse, TokenError, UserError,
} from '@authelion/common';
import { useRequestBody } from '@routup/body';
import { useRequestQuery } from '@routup/query';
import { AuthorizationHeaderType, parseAuthorizationHeader } from 'hapic';
import { Request, getRequestIp } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { OAuth2ClientEntity } from '@authelion/server-database';
import { AbstractGrant } from './abstract';
import { Grant } from './type';
import { OAuth2BearerTokenResponse } from '../response';

export class ClientCredentialsGrant extends AbstractGrant implements Grant {
    async run(request: Request) : Promise<OAuth2TokenGrantResponse> {
        const client = await this.validate(request);

        const accessToken = await this.issueAccessToken({
            remoteAddress: getRequestIp(request, { trustProxy: true }), // todo: check if present
            scope: OAuth2Scope.GLOBAL,
            sub: client.id,
            subKind: OAuth2SubKind.CLIENT,
            realmId: client.realm_id,
            clientId: client.id,
        });

        const refreshToken = await this.issueRefreshToken(accessToken);

        const response = new OAuth2BearerTokenResponse({
            accessToken,
            accessTokenMaxAge: this.config.get('tokenMaxAgeAccessToken'),
            refreshToken,
        });

        return response.build();
    }

    async validate(request: Request) : Promise<OAuth2ClientEntity> {
        const [id, secret] = this.getClientCredentials(request);

        const dataSource = await useDataSource();
        const repository = dataSource.getRepository(OAuth2ClientEntity);

        const entity = await repository.findOneBy({
            id,
            secret,
        });

        if (!entity) {
            throw UserError.credentialsInvalid();
        }

        return entity;
    }

    protected getClientCredentials(request: Request) : [string, string] {
        let clientId = useRequestBody(request, 'client_id') || useRequestQuery(request, 'client_id');
        let clientSecret = useRequestBody(request, 'client_secret') || useRequestQuery(request, 'client_secret');

        if (!clientId && !clientSecret) {
            const { authorization: headerValue } = request.headers;

            const header = parseAuthorizationHeader(headerValue);

            if (header.type !== AuthorizationHeaderType.BASIC) {
                throw TokenError.requestInvalid();
            }

            clientId = header.username;
            clientSecret = header.password;
        }

        return [clientId, clientSecret];
    }
}
