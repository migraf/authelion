/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client, PermissionID,
} from '@authup/common';
import { Ref } from 'vue';
import { useToast } from 'vue-toastification';
import { NuxtPage } from '#components';
import { defineNuxtComponent, navigateTo, useRoute } from '#app';
import {
    definePageMeta, useAPI,
} from '#imports';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { buildDomainEntityNav } from '../../../composables/domain/enity-nav';

export default defineNuxtComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.CLIENT_EDIT,
            ],
        });

        const items = [
            {
                name: 'General', icon: 'fas fa-bars', urlSuffix: '',
            },
        ];

        const toast = useToast();

        const route = useRoute();

        const entity: Ref<Client> = ref(null) as any;

        try {
            entity.value = await useAPI()
                .client
                .getOne(route.params.id as string, { fields: ['+secret'] });
        } catch (e) {
            return navigateTo({ path: '/admin/clients' });
        }

        const handleUpdated = (e: Client) => {
            toast.success('The client was successfully updated.');

            const keys = Object.keys(e) as (keyof Client)[];
            for (let i = 0; i < keys.length; i++) {
                entity.value[keys[i]] = e[keys[i]];
            }
        };

        const handleFailed = (e: Error) => {
            toast.warning(e.message);
        };

        return () => h('div', [
            h('h1', { class: 'title no-border mb-3' }, [
                h('i', { class: 'fa-solid fa-ghost me-1' }),
                entity.value.name,
                h('span', { class: 'sub-title ms-1' }, [
                    'Details',
                ]),
            ]),
            h('div', { class: 'mb-2' }, [
                buildDomainEntityNav(`/admin/clients/${entity.value.id}`, items, { prevLink: true }),
            ]),

            h('div', [
                h(NuxtPage, {
                    onUpdated: handleUpdated,
                    onFailed: handleFailed,
                    entity: entity.value,
                }),
            ]),

        ]);
    },
});