/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import consola from 'consola';
import { ChildProcess } from 'child_process';
import { parseProcessOutputData } from '../../../utils';
import { CommandExecutionContext } from '../../type';
import { UICommand } from '../constants';
import { executeUICommand } from './module';

type Env = {
    port?: number,

    host?: string,

    apiUrl?: string
};
export async function startUI(ctx?: CommandExecutionContext<Env>) : Promise<ChildProcess> {
    ctx = ctx || {};
    ctx.env = ctx.env || {};

    const env : Record<string, any> = {};
    if (ctx.env.port) {
        env.PORT = ctx.env.port;
    }
    if (ctx.env.host) {
        env.HOST = ctx.env.host;
    }
    if (ctx.env.apiUrl) {
        env.NUXT_PUBLIC_API_URL = ctx.env.apiUrl;
    }

    consola.info('UI: Starting...');
    const childProcess = await executeUICommand(UICommand.START, {
        env,
    });
    consola.success('UI: Started');
    childProcess.stdout.on('data', (data) => {
        if (typeof data !== 'string' || data.length === 0) {
            return;
        }

        const lines = parseProcessOutputData(data);
        for (let i = 0; i < lines.length; i++) {
            consola.info(`UI: ${lines[i]}`);
        }
    });

    return childProcess;
}
