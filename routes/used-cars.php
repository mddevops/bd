<?php

use App\Http\Controllers\UsedCarController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:used_cars.view', 'module:used_cars'])->prefix('used-cars')->name('used-cars.')->group(function () {
    Route::get('/', [UsedCarController::class, 'index'])->name('index');

    Route::middleware('permission:used_cars.create')->group(function () {
        Route::get('/create', [UsedCarController::class, 'create'])->name('create');
        Route::post('/', [UsedCarController::class, 'store'])->name('store');
    });

    Route::middleware('role_or_permission:administrator|used_cars.delete')->group(function () {
        Route::post('/bulk/destroy', [UsedCarController::class, 'bulkDestroy'])->name('bulk.destroy');
        Route::post('/bulk/restore', [UsedCarController::class, 'bulkRestore'])->name('bulk.restore');
        Route::post('/bulk/force-destroy', [UsedCarController::class, 'bulkForceDestroy'])->name('bulk.force-destroy');
        Route::post('/{usedCar}/restore', [UsedCarController::class, 'restore'])->whereNumber('usedCar')->name('restore');
        Route::delete('/{usedCar}/force', [UsedCarController::class, 'forceDestroy'])->whereNumber('usedCar')->name('force-destroy');
        Route::delete('/{usedCar}', [UsedCarController::class, 'destroy'])->name('destroy');
    });

    Route::get('/{usedCar}/form-data', [UsedCarController::class, 'carFormData'])->name('form-data');
    Route::get('/{usedCar}/activities', [UsedCarController::class, 'activities'])->name('activities');
    Route::get('/{usedCar}', [UsedCarController::class, 'show'])->name('show');

    Route::middleware('permission:used_cars.update')->group(function () {
        Route::get('/{usedCar}/edit', [UsedCarController::class, 'edit'])->name('edit');
        Route::put('/{usedCar}', [UsedCarController::class, 'update'])->name('update');
        Route::patch('/{usedCar}', [UsedCarController::class, 'update']);
    });
});
