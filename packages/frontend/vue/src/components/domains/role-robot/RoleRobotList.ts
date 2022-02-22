/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';
import { Role } from '@typescript-auth/domains';
import { RoleList } from '../role';
import {
    RobotRoleListItemActions,
    RobotRoleListItemActionsProperties,
} from '../robot-role/RobotRoleListItemActions';
import { SlotName } from '../../constants';
import { RobotList } from '../robot';

export type Properties = {
    [key: string]: any;

    entityId: string
};

export const RoleRobotList = Vue.extend<any, any, any, Properties>({
    name: 'RoleRobotList',
    components: {
        RobotRoleListItemActions,
        RoleList,
    },
    props: {
        entityId: String,
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const buildProps = (item: Role) : RobotRoleListItemActionsProperties => ({
            roleId: vm.entityId,
            robotId: item.id,
        });

        return h(RobotList, {
            scopedSlots: {
                [SlotName.ITEM_ACTIONS]: (slotProps) => h(RobotRoleListItemActions, {
                    props: buildProps(slotProps.item),
                }),
            },
        });
    },
});

export default RoleRobotList;
