<?php

namespace App\Http\Requests\SystemSettings;

use App\Support\CatalogImage;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemSettingsRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('system_settings.manage') ?? false;
  }

  /**
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'app_name' => ['required', 'string', 'max:255'],
      'logo' => CatalogImage::uploadRules(),
      'login_image' => CatalogImage::uploadRules(),
      'remove_logo' => ['sometimes', 'boolean'],
      'remove_login_image' => ['sometimes', 'boolean'],
      'password_reset_enabled' => ['sometimes', 'boolean'],
      'maintenance_mode' => ['sometimes', 'boolean'],
      'module_catalog_enabled' => ['sometimes', 'boolean'],
      'module_users_enabled' => ['sometimes', 'boolean'],
      'module_roles_enabled' => ['sometimes', 'boolean'],
      'module_panel_enabled' => ['sometimes', 'boolean'],
      'module_used_cars_enabled' => ['sometimes', 'boolean'],
      'module_cars_enabled' => ['sometimes', 'boolean'],
      'module_dictionaries_enabled' => ['sometimes', 'boolean'],
    ];
  }

  protected function prepareForValidation(): void
  {
    $this->merge([
      'remove_logo' => $this->boolean('remove_logo'),
      'remove_login_image' => $this->boolean('remove_login_image'),
      'password_reset_enabled' => $this->boolean('password_reset_enabled'),
      'maintenance_mode' => $this->boolean('maintenance_mode'),
      'module_catalog_enabled' => $this->boolean('module_catalog_enabled'),
      'module_users_enabled' => $this->boolean('module_users_enabled'),
      'module_roles_enabled' => $this->boolean('module_roles_enabled'),
      'module_panel_enabled' => $this->boolean('module_panel_enabled'),
      'module_used_cars_enabled' => $this->boolean('module_used_cars_enabled'),
      'module_cars_enabled' => $this->boolean('module_cars_enabled'),
      'module_dictionaries_enabled' => $this->boolean('module_dictionaries_enabled'),
    ]);
  }
}
