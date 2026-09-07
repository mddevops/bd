<?php

namespace App\Http\Controllers\Catalog\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

trait ReordersCatalogItems
{
  /**
   * Переставляет ordering у переданных id.
   * Порядок всегда от 1 и выше; NULL/0 не считаются валидным порядком.
   *
   * @param  class-string<Model>  $modelClass
   * @param  list<int>  $ids
   */
  protected function reorderByIds(string $modelClass, array $ids): void
  {
    $ids = array_values(array_map('intval', $ids));

    if ($ids === []) {
      return;
    }

    DB::transaction(function () use ($modelClass, $ids) {
      $current = $modelClass::query()
        ->whereIn('id', $ids)
        ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
        ->orderBy('ordering')
        ->orderBy('id')
        ->get(['id', 'ordering']);

      if ($current->count() !== count($ids)) {
        abort(422, 'Некоторые записи не найдены.');
      }

      $positive = $current
        ->pluck('ordering')
        ->filter(fn ($value) => $value !== null && (int) $value > 0)
        ->map(fn ($value) => (int) $value)
        ->values();

      $base = $positive->isEmpty() ? 1 : $positive->min();

      foreach ($ids as $index => $id) {
        $modelClass::query()
          ->where('id', $id)
          ->update(['ordering' => $base + $index]);
      }
    });
  }
}
