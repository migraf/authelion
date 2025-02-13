/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CAC } from 'cac';
import consola from 'consola';
import chalk from 'chalk';
import process from 'process';
import {
    ServerCommand, executeServerCommand, handleServerCommandOutput, resetServer, startServer,
} from '../packages';

export function buildServerCommand(cac: CAC) {
    cac.command('server <cmd>', 'Run a specific command.')
        .action(async (command :string) => {
            const root = process.cwd();

            switch (command) {
                case ServerCommand.START: {
                    await startServer({
                        args: {
                            root,
                        },
                    });
                    break;
                }
                case ServerCommand.RESET: {
                    await resetServer({
                        args: {
                            root,
                        },
                    });
                    break;
                }
                default: {
                    consola.warn(`The command ${chalk.red(command)} was not recognized.`);
                    break;
                }
            }
        });
}
