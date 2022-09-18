/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import { Role } from '@authelion/common';
import { SlotName } from '@vue-layout/utils';
import { RoleList } from '../role';
import { RobotRoleAssignmentListItemActions } from './RobotRoleAssignmentListItemActions';

export const RobotRoleAssignmentList = defineComponent({
    name: 'RobotRoleList',
    props: {
        entityId: String,
    },
    setup(props) {
        return () => h(RoleList, {}, {
            [SlotName.ITEM_ACTIONS]: (slotProps: { item: Role }) => h(
                RobotRoleAssignmentListItemActions,
                {
                    robotId: props.entityId,
                    roleId: slotProps.item.id,
                },
            ),
        });
    },
});

export default RobotRoleAssignmentList;
