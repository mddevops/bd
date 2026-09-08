<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Catalog\Concerns\StoresCatalogImages;
use App\Http\Requests\SystemSettings\UpdateSystemSettingsRequest;
use App\Services\SystemSettingsService;
use App\Support\LogoStyle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
  use StoresCatalogImages;

  public function edit(): RedirectResponse
  {
    return redirect()->route('system-settings.branding');
  }

  public function branding(): Response
  {
    return Inertia::render('system-settings/branding', [
      'settings' => $this->settingsPayload(),
    ]);
  }

  public function access(): Response
  {
    return Inertia::render('system-settings/access', [
      'settings' => $this->settingsPayload(),
    ]);
  }

  public function modules(): Response
  {
    return Inertia::render('system-settings/modules', [
      'settings' => $this->settingsPayload(),
    ]);
  }

  public function update(UpdateSystemSettingsRequest $request): RedirectResponse
  {
    $settings = SystemSettingsService::current();
    $validated = $request->validated();
    $section = $validated['section'];

    if ($section === 'branding') {
      $logoPath = $settings->logo_path;
      $loginImagePath = $settings->login_image_path;

      if ($validated['remove_logo'] ?? false) {
        if ($logoPath) {
          Storage::disk('public')->delete($logoPath);
        }
        $logoPath = null;
      }

      if ($validated['remove_login_image'] ?? false) {
        if ($loginImagePath) {
          Storage::disk('public')->delete($loginImagePath);
        }
        $loginImagePath = null;
      }

      if ($request->hasFile('logo')) {
        $logoPath = $this->storeCatalogImage($request->file('logo'), 'system', $logoPath, 'logo');
      }

      if ($request->hasFile('login_image')) {
        $loginImagePath = $this->storeCatalogImage($request->file('login_image'), 'system', $loginImagePath, 'login-image');
      }

      $settings->update([
        'app_name' => $validated['app_name'],
        'logo_path' => $logoPath,
        'logo_style' => LogoStyle::normalize($validated['logo_style'] ?? $settings->logo_style),
        'login_image_path' => $loginImagePath,
      ]);
    }

    if ($section === 'access') {
      $settings->update([
        'password_reset_enabled' => $validated['password_reset_enabled'],
        'maintenance_mode' => $validated['maintenance_mode'],
      ]);
    }

    if ($section === 'modules') {
      $settings->update([
        'module_catalog_enabled' => $validated['module_catalog_enabled'],
        'module_users_enabled' => $validated['module_users_enabled'],
        'module_roles_enabled' => $validated['module_roles_enabled'],
        'module_panel_enabled' => $validated['module_panel_enabled'],
        'module_used_cars_enabled' => $validated['module_used_cars_enabled'],
        'module_cars_enabled' => $validated['module_cars_enabled'],
        'module_dictionaries_enabled' => $validated['module_dictionaries_enabled'],
      ]);
    }

    SystemSettingsService::forgetCache();

    return back()->with('status', 'Настройки системы сохранены');
  }

  /**
   * @return array<string, mixed>
   */
  private function settingsPayload(): array
  {
    $settings = SystemSettingsService::current();

    return [
      'app_name' => $settings->app_name ?? (string) config('app.name'),
      'logo_url' => SystemSettingsService::publicUrl($settings->logo_path),
      'logo_style' => LogoStyle::normalize($settings->logo_style),
      'login_image_url' => SystemSettingsService::publicUrl($settings->login_image_path),
      'password_reset_enabled' => $settings->password_reset_enabled,
      'maintenance_mode' => $settings->maintenance_mode,
      'module_catalog_enabled' => $settings->module_catalog_enabled,
      'module_users_enabled' => $settings->module_users_enabled,
      'module_roles_enabled' => $settings->module_roles_enabled,
      'module_panel_enabled' => $settings->module_panel_enabled,
      'module_used_cars_enabled' => $settings->module_used_cars_enabled ?? true,
      'module_cars_enabled' => $settings->module_cars_enabled ?? true,
      'module_dictionaries_enabled' => $settings->module_dictionaries_enabled ?? true,
    ];
  }
}
