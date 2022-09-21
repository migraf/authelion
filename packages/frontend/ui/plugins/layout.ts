/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Navigation, { Component, build } from '@vue-layout/navigation';
import { addRouteMiddleware, defineNuxtPlugin, useState } from '#app';
import { NavigationProvider } from '../config/layout/module';
import { useAuthStore } from '../store/auth';

export default defineNuxtPlugin((ctx) => {
    const components = useState<Component[]>('navigationComponents', () => []);
    const componentsActive = useState<Component[]>('navigationComponentsActive', () => []);
    const tiers = useState<number | undefined>('navigationTiers', () => undefined);

    const store = useAuthStore(ctx.$pinia);

    ctx.vueApp.use(Navigation, {
        state: {
            components,
            componentsActive,
            tiers,
        },
        provider: new NavigationProvider({
            isLoggedIn: () => store.loggedIn,
            hasPermission: (name) => store.has(name),
        }),
    });

    addRouteMiddleware(async (to, from) => {
        await build({ url: to.fullPath });
    });
});