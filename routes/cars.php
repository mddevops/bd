<?php

use App\Http\Controllers\CarController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:cars.view', 'module:cars'])->prefix('cars')->name('cars.')->group(function () {
    Route::get('/', [CarController::class, 'index'])->name('index');

    Route::middleware('permission:cars.create')->group(function () {
        Route::get('/create', [CarController::class, 'create'])->name('create');
        Route::post('/', [CarController::class, 'store'])->name('store');
    });

    Route::get('/{car}/form-data', [CarController::class, 'carFormData'])->name('form-data');
    Route::get('/{car}/activities', [CarController::class, 'activities'])->name('activities');
    Route::get('/{car}', [CarController::class, 'show'])->name('show');

    Route::middleware('permission:cars.update')->group(function () {
        Route::get('/{car}/edit', [CarController::class, 'edit'])->name('edit');
        Route::put('/{car}', [CarController::class, 'update'])->name('update');
        Route::patch('/{car}', [CarController::class, 'update']);
    });

    Route::delete('/{car}', [CarController::class, 'destroy'])
        ->middleware('permission:cars.delete')
        ->name('destroy');
});
