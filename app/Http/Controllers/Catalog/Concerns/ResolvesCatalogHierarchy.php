<?php

namespace App\Http\Controllers\Catalog\Concerns;

use App\Models\Catalog\AutoSerie;
use App\Services\Catalog\CatalogSelectService;

trait ResolvesCatalogHierarchy
{
  /**
   * @return array{
   *   defaultMarkId: int|null,
   *   defaultModelId: int|null,
   *   defaultGenerationId: int|null,
   *   defaultSeriesId: int|null,
   *   defaultModificationId: int|null,
   *   selectedMark: array{id: int, label: string}|null,
   *   selectedModel: array{id: int, label: string}|null,
   *   selectedGeneration: array{id: int, label: string}|null,
   *   selectedSeries: array{id: int, label: string}|null,
   *   selectedModification: array{id: int, label: string}|null,
   * }
   */
  protected function catalogHierarchyFormData(
    CatalogSelectService $selects,
    ?int $markId = null,
    ?int $modelId = null,
    ?int $generationId = null,
    ?int $seriesId = null,
    ?int $modificationId = null,
  ): array {
    if ($seriesId && (! $markId || ! $modelId || ! $generationId)) {
      $series = AutoSerie::query()
        ->with(['model.mark:id,name', 'generation:id,name'])
        ->find($seriesId);

      $markId = $markId ?: $series?->model?->mark_id;
      $modelId = $modelId ?: $series?->model_id;
      $generationId = $generationId ?: $series?->generation_id;
    }

    return [
      'defaultMarkId' => $markId,
      'defaultModelId' => $modelId,
      'defaultGenerationId' => $generationId,
      'defaultSeriesId' => $seriesId,
      'defaultModificationId' => $modificationId,
      'selectedMark' => $markId ? $selects->find('marks', $markId) : null,
      'selectedModel' => $modelId ? $selects->find('models', $modelId) : null,
      'selectedGeneration' => $generationId ? $selects->find('generations', $generationId) : null,
      'selectedSeries' => $seriesId ? $selects->find('series', $seriesId) : null,
      'selectedModification' => $modificationId ? $selects->find('modifications', $modificationId) : null,
    ];
  }
}
