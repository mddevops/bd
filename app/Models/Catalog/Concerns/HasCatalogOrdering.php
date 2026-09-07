<?php

namespace App\Models\Catalog\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait HasCatalogOrdering
{
  /**
   * Сортировка: сначала записи с ordering >= 1, затем NULL/0.
   */
  public function scopeOrderedByCatalog(Builder $query): Builder
  {
    return $query
      ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
      ->orderBy('ordering')
      ->orderBy('name');
  }

  public static function normalizeOrdering(mixed $value): ?int
  {
    if ($value === null || $value === '' || (int) $value <= 0) {
      return null;
    }

    return (int) $value;
  }
}
