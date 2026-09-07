<?php

use App\Http\Controllers\Catalog\AutoCharacteristicController;
use App\Http\Controllers\Catalog\AutoEquipmentController;
use App\Http\Controllers\Catalog\AutoGenerationController;
use App\Http\Controllers\Catalog\AutoMarkController;
use App\Http\Controllers\Catalog\AutoModelController;
use App\Http\Controllers\Catalog\AutoModificationController;
use App\Http\Controllers\Catalog\AutoOptionController;
use App\Http\Controllers\Catalog\AutoSerieController;
use App\Http\Controllers\Catalog\CatalogController;
use App\Http\Controllers\Catalog\CatalogSelectController;
use App\Models\Catalog\AutoSerie;
use Illuminate\Support\Facades\Route;

Route::bind('series', fn (string $value) => AutoSerie::query()->findOrFail($value));

Route::middleware(['auth', 'permission:catalog.view', 'module:catalog'])->prefix('catalog')->name('catalog.')->group(function () {
    Route::get('/', [CatalogController::class, 'index'])->name('index');
    Route::get('select/{type}', CatalogSelectController::class)->name('select');

    Route::middleware('permission:catalog.manage')->group(function () {
        Route::get('marks/create', [AutoMarkController::class, 'create'])->name('marks.create');
        Route::post('marks', [AutoMarkController::class, 'store'])->name('marks.store');
        Route::post('marks/reorder', [AutoMarkController::class, 'reorder'])->name('marks.reorder');
        Route::post('marks/bulk/status', [AutoMarkController::class, 'bulkUpdateStatus'])->name('marks.bulk.status');
        Route::post('marks/bulk/destroy', [AutoMarkController::class, 'bulkDestroy'])->name('marks.bulk.destroy');
        Route::get('marks/export', [AutoMarkController::class, 'export'])->name('marks.export');
        Route::patch('marks/{mark}/ordering', [AutoMarkController::class, 'updateOrdering'])->name('marks.ordering');
        Route::get('marks/{mark}/edit', [AutoMarkController::class, 'edit'])->name('marks.edit');
        Route::put('marks/{mark}', [AutoMarkController::class, 'update'])->name('marks.update');
        Route::delete('marks/{mark}', [AutoMarkController::class, 'destroy'])->name('marks.destroy');

        Route::get('models/create', [AutoModelController::class, 'create'])->name('models.create');
        Route::post('models', [AutoModelController::class, 'store'])->name('models.store');
        Route::post('models/reorder', [AutoModelController::class, 'reorder'])->name('models.reorder');
        Route::patch('models/{model}/ordering', [AutoModelController::class, 'updateOrdering'])->name('models.ordering');
        Route::get('models/{model}/edit', [AutoModelController::class, 'edit'])->name('models.edit');
        Route::put('models/{model}', [AutoModelController::class, 'update'])->name('models.update');
        Route::delete('models/{model}', [AutoModelController::class, 'destroy'])->name('models.destroy');

        Route::get('generations/create', [AutoGenerationController::class, 'create'])->name('generations.create');
        Route::post('generations', [AutoGenerationController::class, 'store'])->name('generations.store');
        Route::get('generations/{generation}/edit', [AutoGenerationController::class, 'edit'])->name('generations.edit');
        Route::put('generations/{generation}', [AutoGenerationController::class, 'update'])->name('generations.update');
        Route::delete('generations/{generation}', [AutoGenerationController::class, 'destroy'])->name('generations.destroy');

        Route::get('series/create', [AutoSerieController::class, 'create'])->name('series.create');
        Route::post('series', [AutoSerieController::class, 'store'])->name('series.store');
        Route::get('series/{series}/edit', [AutoSerieController::class, 'edit'])->name('series.edit');
        Route::put('series/{series}', [AutoSerieController::class, 'update'])->name('series.update');
        Route::delete('series/{series}', [AutoSerieController::class, 'destroy'])->name('series.destroy');

        Route::get('modifications/create', [AutoModificationController::class, 'create'])->name('modifications.create');
        Route::post('modifications', [AutoModificationController::class, 'store'])->name('modifications.store');
        Route::get('modifications/{modification}/edit', [AutoModificationController::class, 'edit'])->name('modifications.edit');
        Route::put('modifications/{modification}', [AutoModificationController::class, 'update'])->name('modifications.update');
        Route::delete('modifications/{modification}', [AutoModificationController::class, 'destroy'])->name('modifications.destroy');

        Route::get('equipments/create', [AutoEquipmentController::class, 'create'])->name('equipments.create');
        Route::post('equipments', [AutoEquipmentController::class, 'store'])->name('equipments.store');
        Route::get('equipments/{equipment}/edit', [AutoEquipmentController::class, 'edit'])->name('equipments.edit');
        Route::put('equipments/{equipment}', [AutoEquipmentController::class, 'update'])->name('equipments.update');
        Route::delete('equipments/{equipment}', [AutoEquipmentController::class, 'destroy'])->name('equipments.destroy');

        Route::get('characteristics/create', [AutoCharacteristicController::class, 'create'])->name('characteristics.create');
        Route::post('characteristics', [AutoCharacteristicController::class, 'store'])->name('characteristics.store');
        Route::get('characteristics/{characteristic}/edit', [AutoCharacteristicController::class, 'edit'])->name('characteristics.edit');
        Route::put('characteristics/{characteristic}', [AutoCharacteristicController::class, 'update'])->name('characteristics.update');
        Route::delete('characteristics/{characteristic}', [AutoCharacteristicController::class, 'destroy'])->name('characteristics.destroy');

        Route::get('options/create', [AutoOptionController::class, 'create'])->name('options.create');
        Route::post('options', [AutoOptionController::class, 'store'])->name('options.store');
        Route::get('options/{option}/edit', [AutoOptionController::class, 'edit'])->name('options.edit');
        Route::put('options/{option}', [AutoOptionController::class, 'update'])->name('options.update');
        Route::delete('options/{option}', [AutoOptionController::class, 'destroy'])->name('options.destroy');
    });

    Route::get('marks', [AutoMarkController::class, 'index'])->name('marks.index');
    Route::get('models', [AutoModelController::class, 'index'])->name('models.index');
    Route::get('generations', [AutoGenerationController::class, 'index'])->name('generations.index');
    Route::get('series', [AutoSerieController::class, 'index'])->name('series.index');
    Route::get('modifications', [AutoModificationController::class, 'index'])->name('modifications.index');
    Route::get('equipments', [AutoEquipmentController::class, 'index'])->name('equipments.index');
    Route::get('characteristics', [AutoCharacteristicController::class, 'index'])->name('characteristics.index');
    Route::get('options', [AutoOptionController::class, 'index'])->name('options.index');
});
