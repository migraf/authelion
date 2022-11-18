/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Arguments, Argv, CommandModule } from 'yargs';
import {
    resetCommand, useConfig,
} from '@authelion/server-core';

import { buildDataSourceOptions } from '../database/utils';

interface ResetArguments extends Arguments {
    root: string;
}

export class ResetCommand implements CommandModule {
    command = 'reset';

    describe = 'Reset the server.';

    builder(args: Argv) {
        return args
            .option('root', {
                alias: 'r',
                default: process.cwd(),
                describe: 'Path to the project root directory.',
            });
    }

    async handler(args: ResetArguments) {
        await useConfig(args.root);

        const dataSourceOptions = await buildDataSourceOptions();

        await resetCommand({
            dataSourceOptions,
        });

        process.exit(0);
    }
}