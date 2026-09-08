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
        title: 'Модули',
        href: '/system-settings/modules',
    },
];

export default function SystemSettingsModules({ settings }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('system_settings.manage');

    const { data, setData, post, processing, recentlySuccessful } = useForm<{
        _method: string;
        section: 'modules';
        module_panel_enabled: boolean;
        module_catalog_enabled: boolean;
        module_used_cars_enabled: boolean;
        module_cars_enabled: boolean;
        module_dictionaries_enabled: boolean;
        module_users_enabled: boolean;
        module_roles_enabled: boolean;
    }>({
        _method: 'patch',
        section: 'modules',
        module_panel_enabled: settings.module_panel_enabled,
        module_catalog_enabled: settings.module_catalog_enabled,
        module_used_cars_enabled: settings.module_used_cars_enabled,
        module_cars_enabled: settings.module_cars_enabled,
        module_dictionaries_enabled: settings.module_dictionaries_enabled,
        module_users_enabled: settings.module_users_enabled,
        module_roles_enabled: settings.module_roles_enabled,
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
            <Head title="Модули" />

            <SystemSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Модули" description="Включение и отключение разделов CRM" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_panel_enabled}
                                    onCheckedChange={(checked) => setData('module_panel_enabled', checked === true)}
                                    disabled={!canManage}
                                />
                                Панель
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_catalog_enabled}
                                    onCheckedChange={(checked) => setData('module_catalog_enabled', checked === true)}
                                    disabled={!canManage}
                                />
                                Каталог
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_used_cars_enabled}
                                    onCheckedChange={(checked) =>
                                        setData('module_used_cars_enabled', checked === true)
                                    }
                                    disabled={!canManage}
                                />
                                Авто с пробегом
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_cars_enabled}
                                    onCheckedChange={(checked) => setData('module_cars_enabled', checked === true)}
                                    disabled={!canManage}
                                />
                                Новые авто
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_dictionaries_enabled}
                                    onCheckedChange={(checked) =>
                                        setData('module_dictionaries_enabled', checked === true)
                                    }
                                    disabled={!canManage}
                                />
                                Справочники
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_users_enabled}
                                    onCheckedChange={(checked) => setData('module_users_enabled', checked === true)}
                                    disabled={!canManage}
                                />
                                Пользователи
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.module_roles_enabled}
                                    onCheckedChange={(checked) => setData('module_roles_enabled', checked === true)}
                                    disabled={!canManage}
                                />
                                Роли
                            </label>
                        </div>

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
