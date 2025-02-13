/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { NuxtLink, NuxtPage } from '#components';
import { definePageMeta, resolveComponent } from '#imports';
import AccountSVG from '../../components/svg/AccountSVG';
import { buildDomainEntityNav } from '../../composables/domain/enity-nav';
import { LayoutKey, LayoutNavigationID } from '../../config/layout';

export default defineComponent({
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        const items = [
            {
                name: 'Account', icon: 'fas fa-bars', urlSuffix: '',
            },
            {
                name: 'Security', icon: 'fa fa-lock', urlSuffix: '/security',
            },
        ];

        return () => h('div', [
            h('div', {
                class: 'text-center',
            }, [
                h(AccountSVG),
            ]),
            h('h1', { class: 'title no-border mb-3' }, [
                h('i', { class: 'fa fa-cog' }),
                'Settings',
                h('span', { class: 'sub-title ms-1' }, [
                    'Management',
                ]),
            ]),
            h('div', { class: 'content-wrapper' }, [
                h('div', { class: 'content-sidebar flex-column' }, [
                    buildDomainEntityNav('/settings', items, { direction: 'vertical' }),
                ]),
                h('div', { class: 'content-container' }, [
                    h(NuxtPage),
                ]),
            ]),
        ]);
    },
});
