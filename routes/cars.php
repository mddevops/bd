<?php

use App\Http\Controllers\CarController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:cars.view', 'module:cars'])->prefix('cars')->name('cars.')->group(function () {
    Route::get('/', [CarController::class, 'index'])->name('index');

    Route::middleware('permission:cars.create')->group(function () {
        Route::get('/create', [CarController::class, 'create'])->name('create');
        Route::post('/', [CarController::class, 'store'])->name('store');
    });

    Route::middleware('role_or_permission:administrator|cars.delete')->group(function () {
        Route::post('/bulk/destroy', [CarController::class, 'bulkDestroy'])->name('bulk.destroy');
        Route::post('/bulk/restore', [CarController::class, 'bulkRestore'])->name('bulk.restore');
        Route::post('/bulk/force-destroy', [CarController::class, 'bulkForceDestroy'])->name('bulk.force-destroy');
        Route::post('/{car}/restore', [CarController::class, 'restore'])->whereNumber('car')->name('restore');
        Route::delete('/{car}/force', [CarController::class, 'forceDestroy'])->whereNumber('car')->name('force-destroy');
        Route::delete('/{car}', [CarController::class, 'destroy'])->name('destroy');
    });

    Route::get('/{car}/form-data', [CarController::class, 'carFormData'])->name('form-data');
    Route::get('/{car}/activities', [CarController::class, 'activities'])->name('activities');
    Route::get('/{car}', [CarController::class, 'show'])->name('show');

    Route::middleware('permission:cars.update')->group(function () {
        Route::get('/{car}/edit', [CarController::class, 'edit'])->name('edit');
        Route::put('/{car}', [CarController::class, 'update'])->name('update');
        Route::patch('/{car}', [CarController::class, 'update']);
    });
});
