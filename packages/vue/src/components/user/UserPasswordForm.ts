/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import useVuelidate from '@vuelidate/core';
import {
    maxLength, minLength, required, sameAs,
} from '@vuelidate/validators';
import {
    defineComponent, h, reactive, ref, toRef,
} from 'vue';
import { buildFormInput, buildFormInputCheckbox, buildFormSubmit } from '@vue-layout/hyperscript';
import { useHTTPClient } from '../../utils';
import { useAuthIlingo } from '../../language/singleton';
import { buildVuelidateTranslator } from '../../language/utils';

export const UserPasswordForm = defineComponent({
    name: 'UserPasswordForm',
    props: {
        id: {
            type: String,
            required: true,
        },
        translatorLocale: {
            type: String,
            default: undefined,
        },
    },
    emits: ['created', 'deleted', 'updated', 'failed'],
    setup(props, ctx) {
        const busy = ref(false);
        const form = reactive({
            password: '',
            password_repeat: '',
        });

        const passwordShow = ref(false);
        const passwordRef = toRef(form, 'password');

        const $v = useVuelidate({
            password: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(100),
            },
            password_repeat: {
                minLength: minLength(5),
                maxLength: maxLength(100),
                sameAs: sameAs(passwordRef),
            },
        }, form);

        const submit = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                const user = await useHTTPClient().user.update(props.id, {
                    password: form.password,
                    password_repeat: form.password_repeat,
                });

                ctx.emit('updated', user);
            } catch (e) {
                if (e instanceof Error) {
                    ctx.emit('failed', e);
                }
            }

            busy.value = false;
        };

        const render = () => {
            const password = buildFormInput({
                validationResult: $v.value.password,
                validationTranslator: buildVuelidateTranslator(props.translatorLocale),
                labelContent: 'Password',
                value: form.password,
                onChange(input) {
                    form.password = input;
                },
                props: {
                    type: passwordShow.value ? 'text' : 'password',
                    autocomplete: 'new-password',
                },
            });

            const passwordRepeat = buildFormInput({
                validationResult: $v.value.password_repeat,
                validationTranslator: buildVuelidateTranslator(props.translatorLocale),
                labelContent: 'Password repeat',
                value: form.password_repeat,
                onChange(input) {
                    form.password_repeat = input;
                },
                props: {
                    type: passwordShow.value ? 'text' : 'password',
                    autocomplete: 'new-password',
                },
            });

            const showPassword = buildFormInputCheckbox({
                groupClass: 'mt-3',
                labelContent: [
                    'Password ',
                    (passwordShow.value ? 'hide' : 'show'),
                ],
                value: passwordShow.value,
                onChange(input) {
                    passwordShow.value = input;
                },
            });

            const submitButton = buildFormSubmit({
                updateText: useAuthIlingo().getSync('form.update.button'),
                createText: useAuthIlingo().getSync('form.create.button'),
                submit,
                isEditing: true,
            });

            return h('form', {
                onSubmit($event: any) {
                    $event.preventDefault();

                    return submit.apply(null);
                },
            }, [
                password,
                passwordRepeat,
                showPassword,
                submitButton,
            ]);
        };

        return () => render();
    },
});

export default UserPasswordForm;
