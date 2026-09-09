import { type LogoStyleSettings } from '@/lib/logo-style';

export interface SystemSettingsPayload {
    app_name: string;
    logo_url: string | null;
    logo_style: LogoStyleSettings;
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
    activity_log_view_enabled: boolean;
    activity_log_update_enabled: boolean;
    activity_log_delete_enabled: boolean;
    activity_log_restore_enabled: boolean;
}
