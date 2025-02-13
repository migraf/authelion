/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName, Role, isRealmResourceWritable } from '@authup/common';
import { storeToRefs } from 'pinia';
import { navigateTo } from '#app';
import { definePageMeta, resolveComponent } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';
import { useAuthStore } from '../../../../store/auth';

export default defineComponent({
    emits: ['failed', 'created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.ROLE_ADD,
            ],
        });

        const handleCreated = (e: Role) => {
            navigateTo({ path: `/admin/roles/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const form = resolveComponent('RoleForm');

        const store = useAuthStore();
        const { realmManagement, realmManagementId } = storeToRefs(store);

        return () => {
            let realmId : string | undefined;

            if (!isRealmResourceWritable(realmManagement.value)) {
                realmId = realmManagementId.value;
            }

            return h(form, {
                onCreated: handleCreated,
                onFailed: handleFailed,
                realmId,
            });
        };
    },
});
