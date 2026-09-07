<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'permission:panel.prosmotr', 'module:panel'])->group(function () {
    Route::get('dashboard', App\Http\Controllers\DashboardController::class)->name('dashboard');
});

require __DIR__.'/polzovateli.php';
require __DIR__.'/catalog.php';
require __DIR__.'/used-cars.php';
require __DIR__.'/cars.php';
require __DIR__.'/dictionaries.php';
require __DIR__.'/settings.php';
require __DIR__.'/system-settings.php';
require __DIR__.'/auth.php';
