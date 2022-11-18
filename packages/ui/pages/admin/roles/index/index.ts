/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Role } from '@authelion/common';
import { AuthEntityDelete } from '@authelion/vue';
import { ListItemSlotProps, SlotName } from '@vue-layout/hyperscript';
import { NuxtLink } from '#components';
import { resolveComponent } from '#imports';

export default defineComponent({
    emits: ['deleted'],
    setup(props, { emit }) {
        const list = resolveComponent('RoleList');

        const handleDeleted = (e) => {
            emit('deleted', e);
        };

        return () => h(list as string, {
            onDeleted: handleDeleted,
        }, {
            [SlotName.HEADER]: () => h('h6', [
                h('i', { class: 'fa-solid fa-list pe-1' }),
                'Overview',
            ]),
            [SlotName.ITEM_ACTIONS]: (props: ListItemSlotProps<Role>) => h('div', [
                h(NuxtLink, { class: 'btn btn-xs btn-outline-primary me-1', to: `/admin/roles/${props.data.id}` }, {
                    default: () => h('i', { class: 'fa fa-bars' }),
                }),
                h(AuthEntityDelete, {
                    class: 'btn btn-xs btn-outline-danger',
                    entityId: props.data.id,
                    entityType: 'role',
                    withText: false,
                    onDeleted: props.deleted,
                }),
            ]),
        });
    },
});