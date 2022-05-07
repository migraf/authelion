/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/* istanbul ignore next */
import {
    OAuth2TokenGrant, OAuth2TokenResponse, TokenError,
} from '@authelion/common';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { determineRequestTokenGrantType } from '../../../oauth2/grant-types/utils/determine';
import { Grant, GrantContext } from '../../../oauth2/grant-types/type';
import { PasswordGrantType, RobotCredentialsGrantType } from '../../../oauth2';
import { RefreshTokenGrantType } from '../../../oauth2/grant-types/refresh-token';
import { Config, useConfig } from '../../../../config';

/**
 *
 * @param req
 * @param res
 * @param config
 *
 * @throws TokenError
 */
export async function createTokenRouteHandler(
    req: ExpressRequest,
    res: ExpressResponse,
    config?: Config,
) : Promise<any> {
    const grantType = determineRequestTokenGrantType(req);
    if (!grantType) {
        throw TokenError.grantInvalid();
    }

    config ??= await useConfig();

    let grant : Grant | undefined;

    const grantContext : GrantContext = {
        request: req,
        config,
    };

    switch (grantType) {
        case OAuth2TokenGrant.ROBOT_CREDENTIALS: {
            grant = new RobotCredentialsGrantType(grantContext);
            break;
        }
        case OAuth2TokenGrant.PASSWORD: {
            grant = new PasswordGrantType(grantContext);
            break;
        }
        case OAuth2TokenGrant.REFRESH_TOKEN: {
            grant = new RefreshTokenGrantType(grantContext);
            break;
        }
    }

    const tokenResponse : OAuth2TokenResponse = await grant.run();

    return res.respond({
        data: tokenResponse,
    });
}
