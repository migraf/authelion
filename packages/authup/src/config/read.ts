/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'rc9';
import { OptionsInput } from './type';

export async function readConfig(
    directoryPath?: string,
) : Promise<OptionsInput> {
    directoryPath ??= process.cwd();

    const filePath = path.resolve(directoryPath, 'authup.conf');

    try {
        await fs.promises.access(filePath);
    } catch (e) {
        return {};
    }

    const file = await fs.promises.readFile(
        filePath,
        { encoding: 'utf-8' },
    );

    return parse(file);
}
