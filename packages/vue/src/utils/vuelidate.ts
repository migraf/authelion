/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { helpers } from '@vuelidate/validators';

export const alphaNumHyphenUnderscore = helpers.regex(/^[a-z0-9-_]*$/);
export const alphaWithUpperNumHyphenUnderScore = helpers.regex(/^[a-zA-Z0-9-_]*$/);
