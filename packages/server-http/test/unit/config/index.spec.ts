/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    setConfigOptions,
    unsetConfig,
    useConfig,
} from '../../../src';

describe('src/config/*.ts', () => {
    it('should set & use config', async () => {
        const config = await useConfig();

        expect(config).toBeDefined();
        expect(config.get('middlewareBody')).toBeTruthy();

        setConfigOptions({
            middlewareBody: false,
        });

        expect(config).toBeDefined();
        expect(config.get('middlewareBody')).toBeFalsy();

        unsetConfig();
    });
});
