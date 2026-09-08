import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

import { CatalogImageField } from '@/components/catalog/catalog-image-field';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { LogoStyleSettingsButton } from '@/components/system-settings/logo-style-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDostup } from '@/hooks/use-dostup';
import AppLayout from '@/layouts/app-layout';
import SystemSettingsLayout from '@/layouts/system-settings/layout';
import { BRAND_LOGO_ACCEPT, isBrandLogoFile } from '@/lib/catalog-image';
import { normalizeLogoStyle, type LogoStyleSettings } from '@/lib/logo-style';
import { type SystemSettingsPayload } from '@/pages/system-settings/types';
import { type BreadcrumbItem } from '@/types';

interface Props {
    settings: SystemSettingsPayload;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Брендинг',
        href: '/system-settings/branding',
    },
];

export default function SystemSettingsBranding({ settings }: Props) {
    const { estPravo } = useDostup();
    const canManage = estPravo('system_settings.manage');
    const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<{
        _method: string;
        section: 'branding';
        app_name: string;
        logo: File | null;
        login_image: File | null;
        remove_logo: boolean;
        remove_login_image: boolean;
        logo_style: LogoStyleSettings;
    }>({
        _method: 'patch',
        section: 'branding',
        app_name: settings.app_name ?? '',
        logo: null,
        login_image: null,
        remove_logo: false,
        remove_login_image: false,
        logo_style: normalizeLogoStyle(settings.logo_style),
    });

    useEffect(() => {
        if (!data.logo) {
            setLogoObjectUrl(null);
            return;
        }

        const url = URL.createObjectURL(data.logo);
        setLogoObjectUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [data.logo]);

    const logoPreviewUrl = data.remove_logo ? null : (logoObjectUrl ?? settings.logo_url);

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
            <Head title="Брендинг" />

            <SystemSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Брендинг" description="Название, логотип и изображение на странице входа" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="app_name">Название CRM</Label>
                            <Input
                                id="app_name"
                                className="mt-1 block w-full"
                                value={data.app_name ?? ''}
                                onChange={(event) => setData('app_name', event.target.value)}
                                disabled={!canManage}
                                required
                            />
                            <InputError className="mt-2" message={errors.app_name} />
                        </div>

                        <CatalogImageField
                            label="Логотип"
                            labelAction={
                                canManage ? (
                                    <LogoStyleSettingsButton
                                        value={data.logo_style}
                                        logoUrl={logoPreviewUrl}
                                        onChange={(logo_style) => setData('logo_style', logo_style)}
                                    />
                                ) : null
                            }
                            value={data.logo}
                            currentUrl={data.remove_logo ? null : settings.logo_url}
                            error={errors.logo}
                            accept={BRAND_LOGO_ACCEPT}
                            formatsHint="JPG, PNG, WebP или SVG"
                            isValidFile={isBrandLogoFile}
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
