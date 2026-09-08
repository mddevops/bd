<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
  protected $table = 'system_settings';

  protected $fillable = [
    'app_name',
    'logo_path',
    'logo_style',
    'login_image_path',
    'password_reset_enabled',
    'maintenance_mode',
    'module_catalog_enabled',
    'module_users_enabled',
    'module_roles_enabled',
    'module_panel_enabled',
    'module_used_cars_enabled',
    'module_cars_enabled',
    'module_dictionaries_enabled',
  ];

  protected function casts(): array
  {
    return [
      'logo_style' => 'array',
      'password_reset_enabled' => 'boolean',
      'maintenance_mode' => 'boolean',
      'module_catalog_enabled' => 'boolean',
      'module_users_enabled' => 'boolean',
      'module_roles_enabled' => 'boolean',
      'module_panel_enabled' => 'boolean',
      'module_used_cars_enabled' => 'boolean',
      'module_cars_enabled' => 'boolean',
      'module_dictionaries_enabled' => 'boolean',
    ];
  }
}
