<?php

use App\Http\Controllers\PolzovatelController;
use App\Http\Controllers\RolController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:polzovateli.prosmotr', 'module:users'])->group(function () {
    Route::get('polzovateli', [PolzovatelController::class, 'index'])->name('polzovateli.index');

    Route::middleware('permission:polzovateli.sozdanie')->group(function () {
        Route::get('polzovateli/create', [PolzovatelController::class, 'create'])->name('polzovateli.create');
        Route::post('polzovateli', [PolzovatelController::class, 'store'])->name('polzovateli.store');
    });

    Route::middleware('permission:polzovateli.redaktirovanie')->group(function () {
        Route::get('polzovateli/{polzovatel}/edit', [PolzovatelController::class, 'edit'])->name('polzovateli.edit');
        Route::put('polzovateli/{polzovatel}', [PolzovatelController::class, 'update'])->name('polzovateli.update');
    });

    Route::delete('polzovateli/{polzovatel}', [PolzovatelController::class, 'destroy'])
        ->middleware('permission:polzovateli.udalenie')
        ->name('polzovateli.destroy');
});

Route::middleware(['auth', 'permission:roli.prosmotr', 'module:roles'])->group(function () {
    Route::get('roli', [RolController::class, 'index'])->name('roli.index');

    Route::middleware('permission:roli.upravlenie')->group(function () {
        Route::get('roli/create', [RolController::class, 'create'])->name('roli.create');
        Route::post('roli', [RolController::class, 'store'])->name('roli.store');
        Route::get('roli/{rol}/edit', [RolController::class, 'edit'])->name('roli.edit');
        Route::put('roli/{rol}', [RolController::class, 'update'])->name('roli.update');
    });

    Route::delete('roli/{rol}', [RolController::class, 'destroy'])
        ->middleware('permission:roli.udalenie')
        ->name('roli.destroy');
});
