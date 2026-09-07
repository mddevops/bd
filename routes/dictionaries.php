<?php

use App\Http\Controllers\DictionaryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'permission:dictionaries.view', 'module:dictionaries'])->prefix('dictionaries')->name('dictionaries.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('dictionaries.index', ['type' => 'body-types']);
    })->name('home');

    Route::get('/{type}', [DictionaryController::class, 'index'])->name('index');

    Route::middleware('permission:dictionaries.manage')->group(function () {
        Route::post('/{type}/reorder', [DictionaryController::class, 'reorder'])->name('reorder');
        Route::post('/{type}', [DictionaryController::class, 'store'])->name('store');
        Route::put('/{type}/{id}', [DictionaryController::class, 'update'])->name('update');
        Route::patch('/{type}/{id}', [DictionaryController::class, 'update']);
        Route::delete('/{type}/{id}', [DictionaryController::class, 'destroy'])->name('destroy');
    });
});
