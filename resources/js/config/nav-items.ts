import { BookOpen, Car, CarFront, LayoutGrid, Settings, Shield, Sparkles, Users } from 'lucide-react';

import { type NavGroup, type NavItem } from '@/types';

export const navGroups: NavGroup[] = [
    {
        title: 'Разделы',
        items: [
            {
                title: 'Панель',
                url: '/dashboard',
                icon: LayoutGrid,
                pravo: 'panel.prosmotr',
                module: 'panel',
            },
            {
                title: 'Авто с пробегом',
                url: '/used-cars',
                icon: CarFront,
                pravo: 'used_cars.view',
                module: 'used_cars',
            },
            {
                title: 'Новые авто',
                url: '/cars',
                icon: Sparkles,
                pravo: 'cars.view',
                module: 'cars',
            },
        ],
    },
    {
        title: 'Доступ',
        items: [
            {
                title: 'Пользователи',
                url: '/polzovateli',
                icon: Users,
                pravo: 'polzovateli.prosmotr',
                module: 'users',
            },
            {
                title: 'Роли',
                url: '/roli',
                icon: Shield,
                pravo: 'roli.prosmotr',
                module: 'roles',
            },
        ],
    },
    {
        title: 'Система',
        items: [
            {
                title: 'Каталог',
                url: '/catalog',
                icon: Car,
                pravo: 'catalog.view',
                module: 'catalog',
            },
            {
                title: 'Справочники',
                url: '/dictionaries',
                icon: BookOpen,
                pravo: 'dictionaries.view',
                module: 'dictionaries',
            },
            {
                title: 'Настройки системы',
                url: '/system-settings',
                icon: Settings,
                pravo: 'system_settings.view',
            },
        ],
    },
];

export const osnovnyePunkty: NavItem[] = navGroups.flatMap((group) => group.items);
