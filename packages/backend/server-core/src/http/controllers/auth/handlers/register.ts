/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { MASTER_REALM_ID, User, isValidUserName } from '@authelion/common';
import { BadRequestError, ServerError } from '@typescript-error/http';
import { randomBytes } from 'crypto';
import { ExpressValidationError, matchedValidationData } from '../../../express-validation';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { useDataSource } from '../../../../database';
import { UserRepository } from '../../../../domains';
import { useConfig } from '../../../../config';

export async function createAuthRegisterRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const config = await useConfig();

    if (!config.registration) {
        throw new ServerError('User registration is not enabled.');
    }

    await check('email')
        .exists()
        .notEmpty()
        .isEmail()
        .run(req);

    await check('name')
        .exists()
        .custom((value) => {
            const isValid = isValidUserName(value);
            if (!isValid) {
                throw new BadRequestError('Only the characters [a-z0-9-_]+ are allowed.');
            }

            return isValid;
        })
        .optional({ nullable: true })
        .run(req);

    await check('password')
        .exists()
        .notEmpty()
        .isLength({ min: 5, max: 512 })
        .run(req);

    await check('realm_id')
        .exists()
        .isUUID()
        .optional({ nullable: true })
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data : Partial<User> = matchedValidationData(req, { includeOptionals: true });

    data.realm_id ??= MASTER_REALM_ID;
    data.name ??= data.email;

    if (config.emailVerification) {
        data.active = false;
        data.activate_hash = randomBytes(32).toString('hex'); // todo: create random bytes to hex
    }

    const dataSource = await useDataSource();
    const repository = new UserRepository(dataSource);

    const entity = repository.create(data);

    await repository.save(entity);

    if (config.emailVerification) {
        // todo: send email
    }

    return res.respond({
        data: entity,
    });
}