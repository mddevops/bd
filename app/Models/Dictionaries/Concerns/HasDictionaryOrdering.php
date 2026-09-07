<?php

namespace App\Models\Dictionaries\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait HasDictionaryOrdering
{
  /**
   * Сортировка: сначала записи с ordering >= 1, затем NULL/0.
   */
  public function scopeOrdered(Builder $query): Builder
  {
    return $query
      ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
      ->orderBy('ordering')
      ->orderBy('id');
  }
}
