/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, NotFoundError, ServerError } from '@ebec/http';
import { check, oneOf, validationResult } from 'express-validator';
import { User } from '@authup/common';
import { Request, Response, sendAccepted } from 'routup';
import { FindOptionsWhere } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { useDataSource } from 'typeorm-extension';
import { hasSmtpConfig, useSMTPClient } from '@authup/server-common';
import { UserRepository } from '@authup/server-database';
import {
    useConfig,
} from '../../../../config';
import { findRealm } from '../../../../helpers';
import { RequestValidationError, matchedValidationData } from '../../../../validation';

export async function createAuthPasswordForgotRouteHandler(req: Request, res: Response) : Promise<any> {
    const config = await useConfig();

    if (!config.get('registration')) {
        throw new BadRequestError('User registration is not enabled.');
    }

    if (!config.get('emailVerification')) {
        throw new BadRequestError('Email verification is not enabled, but required to reset a password.');
    }

    if (!hasSmtpConfig() && config.get('env') !== 'test') {
        throw new BadRequestError('SMTP modul is not configured.');
    }

    await oneOf([
        check('email')
            .exists()
            .notEmpty()
            .isEmail(),
        check('name')
            .exists()
            .notEmpty()
            .isString(),
    ])
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

    const where : FindOptionsWhere<User> = {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email } : {}),
    };

    const realm = await findRealm(data.realm_id, true);
    where.realm_id = realm.id;

    const dataSource = await useDataSource();
    const repository = new UserRepository(dataSource);
    const query = repository.createQueryBuilder('user');
    const entity = await query
        .addSelect('user.email')
        .where(where)
        .getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    entity.reset_expires = new Date(Date.now() + (1000 * 60 * 30)).toISOString();
    entity.reset_hash = randomBytes(32).toString('hex');

    const smtpClient = await useSMTPClient();

    await smtpClient.sendMail({
        to: entity.email,
        subject: 'Forgot Password - Reset code',
        html: `
            <p>Please use the code below to reset your account password.</p>
            <p>${entity.reset_hash}</p>
            `,
    });

    return sendAccepted(res);
}
