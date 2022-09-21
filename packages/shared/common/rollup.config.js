/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import includePaths from 'rollup-plugin-includepaths';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import pkg from './package.json';

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

const name = 'Authelion';

export default [
    {
        input: './src/index.ts',

        // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
        // https://rollupjs.org/guide/en/#external
        external: [
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
        ],

        plugins: [
            // Allows node_modules resolution
            resolve({ extensions }),

            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),

            // Compile TypeScript/JavaScript files
            babel({
                extensions,
                babelHelpers: 'bundled',
                include: [
                    'src/**/*',
                ],
                presets: [
                    ['@babel/preset-env', { targets: { node: 16 } }],
                ],
            }),
            terser({
                output: {
                    comments: false,
                },
            }),
        ],
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            }, {
                file: pkg.module,
                format: 'esm',
            },
        ],
    },
    {
        input: './src/index.ts',

        // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
        // https://rollupjs.org/guide/en/#external
        external: [

        ],

        plugins: [
            includePaths({
                external: [
                    'hapic',
                ],
                include: {
                    nanoid: path.join('..', '..', '..', 'node_modules', 'nanoid', 'index.browser.js'),
                },
            }),

            // Allows node_modules resolution
            resolve({ extensions }),

            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),

            // Compile TypeScript/JavaScript files
            babel({
                extensions,
                babelHelpers: 'bundled',
                include: [
                    'src/**/*',
                ],
            }),
            terser({
                output: {
                    ecma: 5,
                    comments: false,
                },
            }),
        ],
        output: [
            {
                file: pkg.browser,
                format: 'esm',
            },
            {
                file: pkg.unpkg,
                format: 'iife',
                name,

                // https://rollupjs.org/guide/en/#outputglobals
                globals: {
                    hapic: 'Hapic',
                },
            },
        ],
    },
];