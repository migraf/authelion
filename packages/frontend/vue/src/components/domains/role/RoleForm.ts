/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import { Role } from '@typescript-auth/domains';
import { buildFormSubmit } from '../../helpers/form/render';
import { ComponentFormData, ComponentFormMethods } from '../../helpers';
import { buildFormInput } from '../../helpers/form/render/input';
import { useHTTPClient } from '../../../utils';

type Properties = {
    entity?: Partial<Role>
};

export const RoleForm = Vue.extend<
ComponentFormData<Role>,
ComponentFormMethods<Role>,
any,
Properties
>({
    name: 'RoleForm',
    props: {
        entity: {
            type: Object as PropType<Role>,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                name: '',
            },

            busy: false,
            message: null,
        };
    },
    validations: {
        form: {
            name: {
                required,
                minLength: minLength(3),
                maxLength: maxLength(30),
            },
        },
    },
    computed: {
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
    },
    created() {
        if (this.isEditing) {
            this.form.name = this.entity.name || '';
        }
    },
    methods: {
        async submit() {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                let response;

                if (this.isEditing) {
                    response = await useHTTPClient().role.update(this.entity.id, this.form);

                    this.$emit('updated', response);
                } else {
                    response = await useHTTPClient().role.create(this.form);

                    this.$emit('created', response);
                }
            } catch (e) {
                if (e instanceof Error) {
                    this.$bvToast.toast(e.message, {
                        variant: 'warning',
                        toaster: 'b-toaster-top-center',
                    });

                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const name = buildFormInput<Role>(this, h, {
            title: 'Name',
            propName: 'name',
        });

        const submit = buildFormSubmit(this, h);

        return h('form', {
            on: {
                submit($event: any) {
                    $event.preventDefault();

                    return vm.submit.apply(null);
                },
            },
        }, [
            name,
            submit,
        ]);
    },
});

export default RoleForm;
