/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import supertest, { SuperTest, Test } from 'supertest';
import { createExpressApp, useConfigSync } from '../../src';

export function useSuperTest() : SuperTest<Test> {
    const config = useConfigSync();

    const expressApp = createExpressApp(config);

    return supertest(expressApp);
}
