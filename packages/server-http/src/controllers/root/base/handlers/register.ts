/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, validationResult } from 'express-validator';
import { User, isValidUserName } from '@authup/common';
import { BadRequestError } from '@ebec/http';
import { randomBytes } from 'node:crypto';
import {
    Request, Response, sendAccepted,
} from 'routup';
import { useDataSource } from 'typeorm-extension';
import { UserRepository } from '@authup/server-database';
import { hasSmtpConfig, useLogger, useSMTPClient } from '@authup/server-common';
import { findRealm } from '../../../../helpers';
import { RequestValidationError, matchedValidationData } from '../../../../validation';
import {
    useConfig,
} from '../../../../config';

export async function createAuthRegisterRouteHandler(req: Request, res: Response) : Promise<any> {
    const config = useConfig();

    if (!config.get('registration')) {
        throw new BadRequestError('User registration is not enabled.');
    }

    if (
        config.get('emailVerification') &&
        config.get('env') !== 'test' &&
        !hasSmtpConfig()
    ) {
        throw new BadRequestError('SMTP options are not defined.');
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
        throw new RequestValidationError(validation);
    }

    const data : Partial<User> = matchedValidationData(req, { includeOptionals: true });

    data.name ??= data.email;

    if (config.get('emailVerification')) {
        data.active = false;
        data.activate_hash = randomBytes(32).toString('hex'); // todo: create random bytes to hex
    }

    const dataSource = await useDataSource();
    const repository = new UserRepository(dataSource);

    const entity = repository.create(data);

    const realm = await findRealm(entity.realm_id, true);
    entity.realm_id = realm.id;

    await repository.save(entity);

    if (config.get('emailVerification')) {
        const smtpClient = await useSMTPClient();

        const info = await smtpClient.sendMail({
            to: entity.email,
            subject: 'Registration - Activation code',
            html: `
                <p>Please use the code below to activate your account and start using the site.</p>
                <p>${entity.activate_hash}</p>
                `,
        });

        useLogger().debug(`Message #${info.messageId} has been sent!`);
    }

    return sendAccepted(res, entity);
}
