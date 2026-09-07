<?php

namespace App\Http\Controllers\Catalog\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait StoresCatalogImages
{
/**
 * Сохраняет файл в public-диске и возвращает относительный путь для БД.
 *
 * Форматы: JPG, PNG, WebP — любой размер (@see CatalogImage).
 * Пример: mark_small/audi.webp, serie/75/sAwK5vTsnREoHj.jpg
 */
  protected function storeCatalogImage(
    ?UploadedFile $file,
    string $directory,
    ?string $currentPath = null,
    ?string $filename = null,
  ): ?string {
    if (! $file) {
      return $currentPath;
    }

    if ($currentPath) {
      Storage::disk('public')->delete($currentPath);
    }

    $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');

    if ($filename) {
      $basename = pathinfo($filename, PATHINFO_FILENAME);
      $storedName = $basename.'.'.$extension;

      return $file->storeAs($directory, $storedName, 'public');
    }

    $storedName = Str::random(14).'.'.$extension;

    return $file->storeAs($directory, $storedName, 'public');
  }

  protected function catalogImageUrl(?string $path): ?string
  {
    if (! $path) {
      return null;
    }

    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
      return $path;
    }

    return Storage::disk('public')->url($path);
  }
}
