import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useDostup } from '@/hooks/use-dostup';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { type SystemSettingsPayload } from '@/pages/system-settings/types';
import { type BreadcrumbItem } from '@/types';

interface Props {
    settings: SystemSettingsPayload;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Доступ',
        href: '/system-settings/access',
    },
];

export default function SystemSettingsAccess({ settings }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('system_settings.manage');

    const { data, setData, post, processing, recentlySuccessful } = useForm<{
        _method: string;
        section: 'access';
        password_reset_enabled: boolean;
        maintenance_mode: boolean;
    }>({
        _method: 'patch',
        section: 'access',
        password_reset_enabled: settings.password_reset_enabled,
        maintenance_mode: settings.maintenance_mode,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!canManage) {
            return;
        }

        post(route('system-settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Доступ" />

            <SystemSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Доступ" description="Параметры входа и обслуживания системы" />

                    <form onSubmit={submit} className="space-y-6">
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={data.password_reset_enabled}
                                onCheckedChange={(checked) => setData('password_reset_enabled', checked === true)}
                                disabled={!canManage}
                            />
                            Разрешить восстановление пароля
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={data.maintenance_mode}
                                onCheckedChange={(checked) => setData('maintenance_mode', checked === true)}
                                disabled={!canManage}
                            />
                            Режим обслуживания (доступ только администраторам настроек)
                        </label>

                        {canManage ? (
                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Сохранить</Button>
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
                        ) : null}
                    </form>
                </div>
            </SystemSettingsLayout>
        </AppLayout>
    );
}
