<?php

use App\Http\Controllers\UsedCarController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:used_cars.view', 'module:used_cars'])->prefix('used-cars')->name('used-cars.')->group(function () {
    Route::get('/', [UsedCarController::class, 'index'])->name('index');

    Route::middleware('permission:used_cars.create')->group(function () {
        Route::get('/create', [UsedCarController::class, 'create'])->name('create');
        Route::post('/', [UsedCarController::class, 'store'])->name('store');
    });

    Route::get('/{usedCar}/form-data', [UsedCarController::class, 'carFormData'])->name('form-data');
    Route::get('/{usedCar}', [UsedCarController::class, 'show'])->name('show');

    Route::middleware('permission:used_cars.update')->group(function () {
        Route::get('/{usedCar}/edit', [UsedCarController::class, 'edit'])->name('edit');
        Route::put('/{usedCar}', [UsedCarController::class, 'update'])->name('update');
        Route::patch('/{usedCar}', [UsedCarController::class, 'update']);
    });

    Route::delete('/{usedCar}', [UsedCarController::class, 'destroy'])
        ->middleware('permission:used_cars.delete')
        ->name('destroy');
});
