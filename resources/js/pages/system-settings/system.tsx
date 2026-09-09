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
        title: 'Система',
        href: '/system-settings/system',
    },
];

export default function SystemSettingsSystem({ settings }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('system_settings.manage');

    const { data, setData, post, processing, recentlySuccessful } = useForm<{
        _method: string;
        section: 'system';
        activity_log_view_enabled: boolean;
        activity_log_update_enabled: boolean;
        activity_log_delete_enabled: boolean;
        activity_log_restore_enabled: boolean;
    }>({
        _method: 'patch',
        section: 'system',
        activity_log_view_enabled: settings.activity_log_view_enabled,
        activity_log_update_enabled: settings.activity_log_update_enabled,
        activity_log_delete_enabled: settings.activity_log_delete_enabled,
        activity_log_restore_enabled: settings.activity_log_restore_enabled,
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
            <Head title="Система" />

            <SystemSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Система"
                        description="Общие параметры CRM. Сюда же позже можно вынести другие системные настройки"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Журнал изменений</h3>
                            <p className="text-muted-foreground text-sm">
                                Включить логирование при
                            </p>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.activity_log_view_enabled}
                                        onCheckedChange={(checked) =>
                                            setData('activity_log_view_enabled', checked === true)
                                        }
                                        disabled={!canManage}
                                    />
                                    Просмотре
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.activity_log_update_enabled}
                                        onCheckedChange={(checked) =>
                                            setData('activity_log_update_enabled', checked === true)
                                        }
                                        disabled={!canManage}
                                    />
                                    Изменении
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.activity_log_delete_enabled}
                                        onCheckedChange={(checked) =>
                                            setData('activity_log_delete_enabled', checked === true)
                                        }
                                        disabled={!canManage}
                                    />
                                    Удалении
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.activity_log_restore_enabled}
                                        onCheckedChange={(checked) =>
                                            setData('activity_log_restore_enabled', checked === true)
                                        }
                                        disabled={!canManage}
                                    />
                                    Восстановлении
                                </label>
                            </div>
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
