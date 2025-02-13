/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ref, VNodeArrayChildren, h } from 'vue';

type Context<T> = {
    add: () => Promise<void>,
    drop: () => Promise<void>,
    item: Ref<T>,
    loaded: Ref<boolean>
};
export function renderListItemAssignmentButton<T>(
    ctx: Context<T>,
) {
    let children: VNodeArrayChildren = [];

    if (ctx.loaded.value) {
        children = [
            h('button', {
                class: ['btn btn-xs', {
                    'btn-success': !ctx.item.value,
                    'btn-danger': ctx.item.value,
                }],
                onClick($event: any) {
                    $event.preventDefault();

                    if (ctx.item.value) {
                        return ctx.drop.call(null);
                    }

                    return ctx.add.call(null);
                },
            }, [
                h('i', {
                    class: ['fa', {
                        'fa-plus': !ctx.item.value,
                        'fa-minus': ctx.item.value,
                    }],
                }),
            ]),
        ];
    }

    return h('div', [children]);
}
