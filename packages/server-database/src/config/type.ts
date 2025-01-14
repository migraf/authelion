/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type Options = {
    /**
     * default: process.cwd()
     */
    rootPath: string,
    /**
     * Relative/absolute path to the writable directory.
     * default: path.join(process.cwd(), 'writable')
     */
    writableDirectoryPath: string,
    /**
     * default: 'development'
     */
    env: string,
    /**
     * default: 'admin'
     */
    adminUsername: string,
    /**
     * default: 'start123'
     */
    adminPassword: string,
    /**
     * default: undefined
     */
    adminPasswordReset?: boolean,
    /**
     * default: false
     */
    robotEnabled: boolean,
    /**
     * default: undefined
     */
    robotSecret?: string,
    /**
     * default: undefined
     */
    robotSecretReset?: boolean,
    /**
     * default: []
     */
    permissions: string[],
};

export type OptionsInput = Partial<Omit<Options, 'permissions'>> & {
    /**
     * default: []
     */
    permissions?: string[] | string
};
