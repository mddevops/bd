<?php

namespace App\Http\Requests\SystemSettings;

use App\Support\CatalogImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
    $section = $this->input('section', 'branding');
    $hexOrEmpty = ['nullable', 'string', 'max:32', 'regex:/^$|^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'];

    $rules = [
      'section' => ['required', Rule::in(['branding', 'access', 'modules'])],
    ];

    if ($section === 'branding') {
      return [
        ...$rules,
        'app_name' => ['required', 'string', 'max:255'],
        'logo' => CatalogImage::logoUploadRules(),
        'login_image' => CatalogImage::uploadRules(),
        'remove_logo' => ['sometimes', 'boolean'],
        'remove_login_image' => ['sometimes', 'boolean'],
        'logo_style' => ['nullable', 'array'],
        'logo_style.light' => ['nullable', 'array'],
        'logo_style.light.background' => $hexOrEmpty,
        'logo_style.light.size' => ['nullable', 'integer', 'min:16', 'max:96'],
        'logo_style.light.color' => $hexOrEmpty,
        'logo_style.dark' => ['nullable', 'array'],
        'logo_style.dark.background' => $hexOrEmpty,
        'logo_style.dark.size' => ['nullable', 'integer', 'min:16', 'max:96'],
        'logo_style.dark.color' => $hexOrEmpty,
      ];
    }

    if ($section === 'access') {
      return [
        ...$rules,
        'password_reset_enabled' => ['required', 'boolean'],
        'maintenance_mode' => ['required', 'boolean'],
      ];
    }

    return [
      ...$rules,
      'module_catalog_enabled' => ['required', 'boolean'],
      'module_users_enabled' => ['required', 'boolean'],
      'module_roles_enabled' => ['required', 'boolean'],
      'module_panel_enabled' => ['required', 'boolean'],
      'module_used_cars_enabled' => ['required', 'boolean'],
      'module_cars_enabled' => ['required', 'boolean'],
      'module_dictionaries_enabled' => ['required', 'boolean'],
    ];
  }

  protected function prepareForValidation(): void
  {
    $section = $this->input('section', 'branding');
    $payload = ['section' => $section];

    $logoStyle = $this->input('logo_style');
    if (is_string($logoStyle)) {
      $decoded = json_decode($logoStyle, true);
      $logoStyle = is_array($decoded) ? $decoded : null;
    }

    if ($section === 'branding') {
      if ($this->has('logo_style') || $logoStyle !== null) {
        $payload['logo_style'] = $logoStyle;
      }

      foreach (['remove_logo', 'remove_login_image'] as $field) {
        if ($this->has($field)) {
          $payload[$field] = $this->boolean($field);
        }
      }
    }

    if ($section === 'access') {
      foreach (['password_reset_enabled', 'maintenance_mode'] as $field) {
        if ($this->has($field)) {
          $payload[$field] = $this->boolean($field);
        }
      }
    }

    if ($section === 'modules') {
      foreach ([
        'module_catalog_enabled',
        'module_users_enabled',
        'module_roles_enabled',
        'module_panel_enabled',
        'module_used_cars_enabled',
        'module_cars_enabled',
        'module_dictionaries_enabled',
      ] as $field) {
        if ($this->has($field)) {
          $payload[$field] = $this->boolean($field);
        }
      }
    }

    $this->merge($payload);
  }
}
