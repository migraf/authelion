/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@authup/common';
import { useToast } from 'vue-toastification';
import { NuxtPage } from '#components';
import { definePageMeta } from '#imports';
import { buildDomainEntityNav } from '../../../composables/domain/enity-nav';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.USER_EDIT,
                PermissionName.USER_ADD,
                PermissionName.USER_DROP,
            ],
        });

        const items = [
            {
                name: 'overview',
                urlSuffix: '',
                icon: 'fa fa-bars',
            },
            {
                name: 'add',
                urlSuffix: '/add',
                icon: 'fa fa-plus',
            },
        ];

        const handleDeleted = (e) => {
            const toast = useToast();
            toast.success(`The user ${e.name} was successfully deleted.`);
        };

        const handleFailed = (e) => {
            const toast = useToast();
            toast.warning(e.message);
        };

        return () => h('div', [
            h('h1', { class: 'title no-border mb-3' }, [
                h('i', { class: 'fa fa-user me-1' }),
                'User',
                h('span', { class: 'sub-title ms-1' }, [
                    'Management',
                ]),
            ]),
            h('div', { class: 'content-wrapper' }, [
                h('div', { class: 'content-sidebar flex-column' }, [
                    buildDomainEntityNav('/admin/users', items, { direction: 'vertical' }),
                ]),
                h('div', { class: 'content-container' }, [
                    h(NuxtPage, {
                        onDeleted: handleDeleted,
                        onFailed: handleFailed,
                    }),
                ]),
            ]),
        ]);
    },
});
