/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    defineComponent, h,
} from 'vue';
import { Robot } from '@authup/common';
import { SlotName } from '@vue-layout/hyperscript';
import {
    RobotRoleAssignmentListItemActions,
} from '../robot-role/RobotRoleAssignmentListItemActions';
import { RobotList } from '../robot';

export const RoleRobotAssignmentList = defineComponent({
    name: 'RoleRobotAssignmentList',
    props: {
        entityId: String,
    },
    setup(props) {
        return () => h(RobotList, {}, {
            [SlotName.ITEM_ACTIONS]: (slotProps: { data: Robot }) => h(
                RobotRoleAssignmentListItemActions,
                {
                    roleId: props.entityId,
                    robotId: slotProps.data.id,
                },
            ),
        });
    },
});

export default RoleRobotAssignmentList;
