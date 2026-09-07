import { LucideIcon } from 'lucide-react';

import { type NastroikiPolzovatelya } from '@/hooks/use-nastroiki';

export interface SystemSettingsShared {
    appName: string;
    logoUrl: string | null;
    loginImageUrl: string;
    passwordResetEnabled: boolean;
    maintenanceMode: boolean;
    modules: {
        catalog: boolean;
        users: boolean;
        roles: boolean;
        panel: boolean;
        used_cars: boolean;
        cars: boolean;
        dictionaries: boolean;
    };
}

export type SystemSettingsModule = keyof SystemSettingsShared['modules'];

export interface Auth {
    user: User | null;
    prava: string[];
    roli: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    pravo?: string;
    module?: SystemSettingsModule;
}

export interface SharedData {
    name: string;
    systemSettings: SystemSettingsShared;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: {
        status?: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    nastroiki?: NastroikiPolzovatelya;
    [key: string]: unknown;
}
