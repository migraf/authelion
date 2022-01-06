/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'path';
import { Arguments, Argv, CommandModule } from 'yargs';
import {
    buildConnectionOptions, dropDatabase,
} from 'typeorm-extension';
import {
    buildDatabaseConnectionOptions,
    createDatabaseDefaultConnectionOptions,
    extendDatabaseConnectionOptions,
} from '../../database/utils';
import { useAuthServerConfig } from '../../config';
import { startAuthServer } from '../../server';

interface StartArguments extends Arguments {
    root: string;
}

export class StartCommand implements CommandModule {
    command = 'start';

    describe = 'Start the server.';

    builder(args: Argv) {
        return args
            .option('root', {
                alias: 'r',
                default: process.cwd(),
                describe: 'Path to the project root directory.',
            });
    }

    async handler(args: StartArguments) {
        const config = useAuthServerConfig(args.root);

        await startAuthServer({
            config,
        });
    }
}