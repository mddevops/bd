import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import NavigationLayoutTabs from '@/components/navigation-layout-tabs';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Оформление',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Оформление" />

            <SettingsLayout>
                <div className="space-y-8">
                    <div className="space-y-6">
                        <HeadingSmall title="Тема оформления" description="Настройте светлую, тёмную или системную тему" />
                        <AppearanceTabs />
                    </div>

                    <div className="space-y-6">
                        <HeadingSmall title="Расположение меню" description="Выберите, где отображать навигацию по разделам CRM" />
                        <NavigationLayoutTabs />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
