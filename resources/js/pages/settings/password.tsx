import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { PasswordFieldWithActions } from '@/components/password-field-with-actions';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Настройки пароля',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Настройки пароля" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Смена пароля" description="Используйте длинный случайный пароль для безопасности аккаунта" />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <PasswordFieldWithActions
                            id="current_password"
                            label="Текущий пароль"
                            value={data.current_password}
                            onChange={(value) => setData('current_password', value)}
                            placeholder="Текущий пароль"
                            error={errors.current_password}
                            showHintActions={false}
                            autoComplete="current-password"
                            inputRef={currentPasswordInput}
                        />

                        <PasswordFieldWithActions
                            id="password"
                            label="Новый пароль"
                            value={data.password}
                            onChange={(value) => setData('password', value)}
                            onGenerated={(password) => {
                                setData('password', password);
                                setData('password_confirmation', password);
                            }}
                            placeholder="Новый пароль"
                            error={errors.password}
                            inputRef={passwordInput}
                        />

                        <PasswordFieldWithActions
                            id="password_confirmation"
                            label="Подтверждение пароля"
                            value={data.password_confirmation}
                            onChange={(value) => setData('password_confirmation', value)}
                            placeholder="Повторите пароль"
                            error={errors.password_confirmation}
                            showHintActions={false}
                        />

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Сохранить пароль</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Сохранено</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
