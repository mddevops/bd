import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import { CatalogImageField } from '@/components/catalog/catalog-image-field';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { useDostup } from '@/hooks/use-dostup';
import { type BreadcrumbItem } from '@/types';

interface SystemSettingsForm {
    app_name: string;
    logo: File | null;
    login_image: File | null;
    remove_logo: boolean;
    remove_login_image: boolean;
    password_reset_enabled: boolean;
    maintenance_mode: boolean;
    module_catalog_enabled: boolean;
    module_users_enabled: boolean;
    module_roles_enabled: boolean;
    module_panel_enabled: boolean;
    module_used_cars_enabled: boolean;
    module_cars_enabled: boolean;
    module_dictionaries_enabled: boolean;
}

interface SettingsPayload {
    app_name: string;
    logo_url: string | null;
    login_image_url: string | null;
    password_reset_enabled: boolean;
    maintenance_mode: boolean;
    module_catalog_enabled: boolean;
    module_users_enabled: boolean;
    module_roles_enabled: boolean;
    module_panel_enabled: boolean;
    module_used_cars_enabled: boolean;
    module_cars_enabled: boolean;
    module_dictionaries_enabled: boolean;
}

interface Props {
    settings: SettingsPayload;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Настройки системы',
        href: '/system-settings',
    },
];

export default function SystemSettingsEdit({ settings }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('system_settings.manage');

    const { data, setData, post, processing, errors } = useForm<SystemSettingsForm & { _method: string }>({
        _method: 'patch',
        app_name: settings.app_name ?? '',
        logo: null,
        login_image: null,
        remove_logo: false,
        remove_login_image: false,
        password_reset_enabled: settings.password_reset_enabled,
        maintenance_mode: settings.maintenance_mode,
        module_catalog_enabled: settings.module_catalog_enabled,
        module_users_enabled: settings.module_users_enabled,
        module_roles_enabled: settings.module_roles_enabled,
        module_panel_enabled: settings.module_panel_enabled,
        module_used_cars_enabled: settings.module_used_cars_enabled,
        module_cars_enabled: settings.module_cars_enabled,
        module_dictionaries_enabled: settings.module_dictionaries_enabled,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!canManage) {
            return;
        }

        post(route('system-settings.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Настройки системы" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                <HeadingSmall
                    title="Настройки системы"
                    description="Брендинг, доступ и модули CRM для всех пользователей"
                />

                <form onSubmit={submit} className="space-y-6">
                    <Tabs defaultValue="branding">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="branding">Брендинг</TabsTrigger>
                            <TabsTrigger value="access">Доступ</TabsTrigger>
                            <TabsTrigger value="modules">Модули</TabsTrigger>
                        </TabsList>

                        <TabsContent value="branding" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Брендинг</CardTitle>
                                    <CardDescription>Название, логотип и изображение на странице входа</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="app_name">Название CRM</Label>
                                        <Input
                                            id="app_name"
                                            value={data.app_name ?? ''}
                                            onChange={(event) => setData('app_name', event.target.value)}
                                            disabled={!canManage}
                                            required
                                        />
                                        {errors.app_name ? <p className="text-destructive text-sm">{errors.app_name}</p> : null}
                                    </div>

                                    <CatalogImageField
                                        label="Логотип"
                                        value={data.logo}
                                        currentUrl={data.remove_logo ? null : settings.logo_url}
                                        error={errors.logo}
                                        onChange={(file) => {
                                            setData('logo', file);
                                            if (file) {
                                                setData('remove_logo', false);
                                            }
                                        }}
                                    />
                                    {canManage && settings.logo_url ? (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={data.remove_logo}
                                                onCheckedChange={(checked) => setData('remove_logo', checked === true)}
                                            />
                                            Удалить текущий логотип
                                        </label>
                                    ) : null}

                                    <CatalogImageField
                                        label="Изображение на странице входа"
                                        value={data.login_image}
                                        currentUrl={data.remove_login_image ? null : settings.login_image_url}
                                        error={errors.login_image}
                                        onChange={(file) => {
                                            setData('login_image', file);
                                            if (file) {
                                                setData('remove_login_image', false);
                                            }
                                        }}
                                    />
                                    {canManage && settings.login_image_url ? (
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={data.remove_login_image}
                                                onCheckedChange={(checked) => setData('remove_login_image', checked === true)}
                                            />
                                            Удалить изображение (будет placeholder)
                                        </label>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="access" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Доступ</CardTitle>
                                    <CardDescription>Параметры входа и обслуживания системы</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="modules" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Модули</CardTitle>
                                    <CardDescription>Включение и отключение разделов CRM</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
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
                                            onCheckedChange={(checked) => setData('module_used_cars_enabled', checked === true)}
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
                                            onCheckedChange={(checked) => setData('module_dictionaries_enabled', checked === true)}
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
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {canManage ? (
                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                Сохранить настройки
                            </Button>
                        </div>
                    ) : null}
                </form>
            </div>
        </AppLayout>
    );
}
