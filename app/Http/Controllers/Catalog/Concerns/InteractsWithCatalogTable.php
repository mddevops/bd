<?php

namespace App\Http\Controllers\Catalog\Concerns;

use Illuminate\Http\Request;

trait InteractsWithCatalogTable
{
  /**
   * @return array{search: string, col: string, sort: string}
   */
  protected function catalogTableState(Request $request): array
  {
    return [
      'search' => $request->string('search')->toString(),
      'col' => $request->string('col')->toString(),
      'sort' => $request->string('sort')->toString(),
    ];
  }

  /**
   * @param  list<string>  $keys
   * @return array<string, int|null>
   */
  protected function catalogFilters(Request $request, array $keys): array
  {
    $filters = [];

    foreach ($keys as $key) {
      $value = $request->integer($key);
      $filters[$key] = $value > 0 ? $value : null;
    }

    return $filters;
  }

  protected function catalogStatusFilter(Request $request, string $key = 'status'): ?bool
  {
    if (! $request->has($key) || $request->query($key) === '' || $request->query($key) === 'all') {
      return null;
    }

    return filter_var($request->query($key), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
      ?? ((string) $request->query($key) === '1');
  }
}
