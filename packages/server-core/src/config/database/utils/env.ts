/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DatabaseOptions, DatabaseOptionsInput } from '../type';
import {
    hasEnv, requireBooleanFromEnv, requireFromEnv,
} from '../../../utils';

export function extractDatabaseOptionsFromEnv() : DatabaseOptionsInput {
    const options : DatabaseOptionsInput = { };

    if (hasEnv('ADMIN_USERNAME')) {
        options.adminUsername = requireFromEnv('ADMIN_USERNAME');
    }

    if (hasEnv('ADMIN_PASSWORD')) {
        options.adminPassword = requireFromEnv('ADMIN_PASSWORD');
    }

    if (hasEnv('ROBOT_ENABLED')) {
        options.robotEnabled = requireBooleanFromEnv('ROBOT_ENABLED');
    }

    if (hasEnv('ROBOT_SECRET')) {
        options.robotSecret = requireFromEnv('ROBOT_SECRET');
    }

    if (hasEnv('PERMISSIONS')) {
        options.permissions = requireFromEnv('PERMISSIONS');
    }

    return options;
}