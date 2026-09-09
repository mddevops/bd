<?php

use App\Http\Controllers\SystemSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:system_settings.view'])->group(function () {
    Route::get('system-settings', [SystemSettingsController::class, 'edit'])->name('system-settings.edit');
    Route::get('system-settings/branding', [SystemSettingsController::class, 'branding'])->name('system-settings.branding');
    Route::get('system-settings/access', [SystemSettingsController::class, 'access'])->name('system-settings.access');
    Route::get('system-settings/modules', [SystemSettingsController::class, 'modules'])->name('system-settings.modules');
    Route::get('system-settings/system', [SystemSettingsController::class, 'system'])->name('system-settings.system');

    Route::middleware('permission:system_settings.manage')->group(function () {
        Route::match(['put', 'patch', 'post'], 'system-settings', [SystemSettingsController::class, 'update'])
            ->name('system-settings.update');
    });
});
