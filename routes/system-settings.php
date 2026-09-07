<?php

use App\Http\Controllers\SystemSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:system_settings.view'])->group(function () {
    Route::get('system-settings', [SystemSettingsController::class, 'edit'])->name('system-settings.edit');

    Route::middleware('permission:system_settings.manage')->group(function () {
        Route::match(['put', 'patch', 'post'], 'system-settings', [SystemSettingsController::class, 'update'])
            ->name('system-settings.update');
    });
});
