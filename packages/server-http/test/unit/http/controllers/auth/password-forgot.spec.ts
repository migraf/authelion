/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DatabaseRootSeederResult } from '@authup/server-database';
import { useSuperTest } from '../../../../utils/supertest';
import { setConfig } from '../../../../../src';
import { dropTestDatabase, useTestDatabase } from '../../../../utils/database/connection';

describe('src/http/controllers/auth/handlers/*.ts', () => {
    const superTest = useSuperTest();

    let seederResponse : DatabaseRootSeederResult | undefined;

    beforeAll(async () => {
        seederResponse = await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    it('should attempt password reset for user', async () => {
        let response;

        setConfig({
            registration: false,
        });

        response = await superTest
            .post('/password-forgot')
            .send({
                name: 'admin',
            });

        expect(response.status).toEqual(500);

        setConfig({
            registration: true,
            emailVerification: true,
        });

        response = await superTest
            .post('/password-forgot')
            .send({
                name: 'admin',
            });

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();
    });
});