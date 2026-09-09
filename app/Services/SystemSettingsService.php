<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Support\LogoStyle;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SystemSettingsService
{
  public const CACHE_KEY = 'system_settings';

  public static function current(): SystemSetting
  {
    return Cache::rememberForever(self::CACHE_KEY, function () {
      return SystemSetting::query()->firstOrCreate(
        ['id' => 1],
        [
          'app_name' => config('app.name'),
          'password_reset_enabled' => true,
          'maintenance_mode' => false,
          'module_catalog_enabled' => true,
          'module_users_enabled' => true,
          'module_roles_enabled' => true,
          'module_panel_enabled' => true,
          'module_used_cars_enabled' => true,
          'module_cars_enabled' => true,
          'module_dictionaries_enabled' => true,
          'activity_log_view_enabled' => true,
          'activity_log_update_enabled' => true,
          'activity_log_delete_enabled' => true,
          'activity_log_restore_enabled' => true,
        ],
      );
    });
  }

  public static function forgetCache(): void
  {
    Cache::forget(self::CACHE_KEY);
  }

  public static function publicUrl(?string $path): ?string
  {
    if (! $path) {
      return null;
    }

    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
      return $path;
    }

    return Storage::disk('public')->url($path);
  }

  /**
   * @return array{
   *   appName: string,
   *   logoUrl: string|null,
   *   logoStyle: array{light: array{background: string, size: int, color: string}, dark: array{background: string, size: int, color: string}},
   *   loginImageUrl: string,
   *   passwordResetEnabled: bool,
   *   maintenanceMode: bool,
   *   modules: array{
   *     catalog: bool,
   *     users: bool,
   *     roles: bool,
   *     panel: bool,
   *     used_cars: bool,
   *     cars: bool,
   *     dictionaries: bool,
   *   }
   * }
   */
  public static function forInertia(): array
  {
    $settings = self::current();

    return [
      'appName' => $settings->app_name ?: (string) config('app.name'),
      'logoUrl' => self::publicUrl($settings->logo_path),
      'logoStyle' => LogoStyle::normalize($settings->logo_style),
      'loginImageUrl' => self::publicUrl($settings->login_image_path) ?? '/placeholder.svg',
      'passwordResetEnabled' => $settings->password_reset_enabled,
      'maintenanceMode' => $settings->maintenance_mode,
      'modules' => [
        'catalog' => $settings->module_catalog_enabled,
        'users' => $settings->module_users_enabled,
        'roles' => $settings->module_roles_enabled,
        'panel' => $settings->module_panel_enabled,
        'used_cars' => $settings->module_used_cars_enabled ?? true,
        'cars' => $settings->module_cars_enabled ?? true,
        'dictionaries' => $settings->module_dictionaries_enabled ?? true,
      ],
    ];
  }

  public static function moduleEnabled(string $module): bool
  {
    $modules = self::forInertia()['modules'];

    return $modules[$module] ?? true;
  }
}
