<?php

namespace App\Services\Catalog;

use App\Models\Catalog\AutoCharacteristic;
use App\Models\Country;
use App\Models\Catalog\AutoEquipment;
use App\Models\Catalog\AutoGeneration;
use App\Models\Catalog\AutoMark;
use App\Models\Catalog\AutoModel;
use App\Models\Catalog\AutoModification;
use App\Models\Catalog\AutoOption;
use App\Models\Catalog\AutoSerie;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class CatalogSelectService
{
  public const LIMIT = 20;

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  public function search(string $type, ?string $query = null, array $filters = [], int $limit = self::LIMIT): Collection
  {
    $limit = max(1, min($limit, self::LIMIT));

    return match ($type) {
      'marks' => $this->searchMarks($query, $limit, $filters),
      'models' => $this->searchModels($query, $filters, $limit),
      'generations' => $this->searchGenerations($query, $filters, $limit),
      'series' => $this->searchSeries($query, $filters, $limit),
      'modifications' => $this->searchModifications($query, $filters, $limit),
      'equipments' => $this->searchEquipments($query, $filters, $limit),
      'characteristics' => $this->searchCharacteristics($query, $filters, $limit),
      'options' => $this->searchOptions($query, $filters, $limit),
      'countries' => $this->searchCountries($query, $filters, $limit),
      default => throw new InvalidArgumentException("Unknown select type: {$type}"),
    };
  }

  /**
   * @return array{id: int, label: string}|null
   */
  public function find(string $type, int $id): ?array
  {
    return $this->search($type, null, ['id' => $id], 1)->first();
  }

  /**
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchMarks(?string $query, int $limit, array $filters = []): Collection
  {
    return AutoMark::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when(
        ! isset($filters['id']),
        function (Builder $q) use ($filters) {
          if (array_key_exists('status', $filters)) {
            if ($filters['status'] !== null && $filters['status'] !== '' && $filters['status'] !== 'all') {
              $status = filter_var($filters['status'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

              $q->where('status', $status ?? ((string) $filters['status'] === '1'));
            }

            return;
          }

          // В select по умолчанию только активные марки
          $q->where('status', true);
        },
      )
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('name', 'like', "%{$query}%")
          ->orWhere('name_ru', 'like', "%{$query}%")
          ->orWhere('url', 'like', "%{$query}%");
      }))
      ->orderedByCatalog()
      ->limit($limit)
      ->get(['id', 'name'])
      ->map(fn (AutoMark $mark) => [
        'id' => $mark->id,
        'label' => $mark->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchModels(?string $query, array $filters, int $limit): Collection
  {
    return AutoModel::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['mark_id'] ?? null, fn (Builder $q, $markId) => $q->where('mark_id', $markId))
      ->when($filters['exclude_id'] ?? null, fn (Builder $q, $excludeId) => $q->where('id', '!=', $excludeId))
      ->when(
        ! isset($filters['id']),
        function (Builder $q) use ($filters) {
          if (array_key_exists('status', $filters)) {
            if ($filters['status'] !== null && $filters['status'] !== '' && $filters['status'] !== 'all') {
              $status = filter_var($filters['status'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

              $q->where('status', $status ?? ((string) $filters['status'] === '1'));
            }

            return;
          }

          $q->where('status', true);
        },
      )
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('auto_models.name', 'like', "%{$query}%")
          ->orWhere('auto_models.name_ru', 'like', "%{$query}%")
          ->orWhere('auto_models.url', 'like', "%{$query}%")
          ->orWhereHas('mark', fn (Builder $mark) => $mark->where('name', 'like', "%{$query}%"));
      }))
      ->orderByRaw('(CASE WHEN auto_models.ordering IS NULL OR auto_models.ordering = 0 THEN 1 ELSE 0 END) ASC')
      ->orderBy('auto_models.ordering')
      ->orderBy('auto_models.name')
      ->limit($limit)
      ->get(['id', 'name', 'mark_id'])
      ->map(fn (AutoModel $model) => [
        'id' => $model->id,
        'label' => $model->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchGenerations(?string $query, array $filters, int $limit): Collection
  {
    return AutoGeneration::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['model_id'] ?? null, fn (Builder $q, $modelId) => $q->where('model_id', $modelId))
      ->when($filters['mark_id'] ?? null, fn (Builder $q, $markId) => $q->whereHas('model', fn (Builder $model) => $model->where('mark_id', $markId)))
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('auto_generations.name', 'like', "%{$query}%")
          ->orWhereHas('model', fn (Builder $model) => $model->where('name', 'like', "%{$query}%"));
      }))
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'model_id', 'year_from', 'year_to'])
      ->map(fn (AutoGeneration $generation) => [
        'id' => $generation->id,
        'label' => (string) ($generation->name ?? ''),
        'optionLabel' => $this->formatGenerationOptionLabel($generation),
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchSeries(?string $query, array $filters, int $limit): Collection
  {
    return AutoSerie::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['generation_id'] ?? null, fn (Builder $q, $generationId) => $q->where('generation_id', $generationId))
      ->when($filters['model_id'] ?? null, fn (Builder $q, $modelId) => $q->where('model_id', $modelId))
      ->when($filters['mark_id'] ?? null, fn (Builder $q, $markId) => $q->whereHas('model', fn (Builder $model) => $model->where('mark_id', $markId)))
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('auto_series.name', 'like', "%{$query}%")
          ->orWhere('auto_series.url', 'like', "%{$query}%")
          ->orWhereHas('model', fn (Builder $model) => $model->where('name', 'like', "%{$query}%"))
          ->orWhereHas('generation', fn (Builder $generation) => $generation->where('name', 'like', "%{$query}%"));
      }))
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'model_id', 'generation_id'])
      ->map(fn (AutoSerie $serie) => [
        'id' => $serie->id,
        'label' => $serie->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchModifications(?string $query, array $filters, int $limit): Collection
  {
    return AutoModification::query()
      ->with('series:id,name')
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['series_id'] ?? null, fn (Builder $q, $seriesId) => $q->where('series_id', $seriesId))
      ->when($filters['generation_id'] ?? null, fn (Builder $q, $generationId) => $q->whereHas('series', fn (Builder $series) => $series->where('generation_id', $generationId)))
      ->when($filters['model_id'] ?? null, fn (Builder $q, $modelId) => $q->whereHas('series', fn (Builder $series) => $series->where('model_id', $modelId)))
      ->when($filters['mark_id'] ?? null, fn (Builder $q, $markId) => $q->whereHas('series.model', fn (Builder $model) => $model->where('mark_id', $markId)))
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('auto_modifications.name', 'like', "%{$query}%")
          ->orWhereHas('series', fn (Builder $series) => $series->where('name', 'like', "%{$query}%"));
      }))
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'series_id'])
      ->map(fn (AutoModification $modification) => [
        'id' => $modification->id,
        'label' => $modification->series
          ? "{$modification->series->name} · {$modification->name}"
          : $modification->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchEquipments(?string $query, array $filters, int $limit): Collection
  {
    return AutoEquipment::query()
      ->with(['series:id,name', 'modification:id,name'])
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['series_id'] ?? null, fn (Builder $q, $seriesId) => $q->where('series_id', $seriesId))
      ->when($query, fn (Builder $q) => $q->where(function (Builder $inner) use ($query) {
        $inner->where('auto_equipments.name', 'like', "%{$query}%");
      }))
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'series_id', 'modification_id'])
      ->map(fn (AutoEquipment $equipment) => [
        'id' => $equipment->id,
        'label' => collect([
          $equipment->series?->name,
          $equipment->modification?->name,
          $equipment->name,
        ])->filter()->implode(' · '),
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchCharacteristics(?string $query, array $filters, int $limit): Collection
  {
    return AutoCharacteristic::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['exclude_id'] ?? null, fn (Builder $q, $excludeId) => $q->where('id', '!=', $excludeId))
      ->when(array_key_exists('parent_id', $filters) && $filters['parent_id'] !== null, fn (Builder $q) => $q->where('parent_id', $filters['parent_id']))
      ->when($query, fn (Builder $q) => $q->where('name', 'like', "%{$query}%"))
      ->orderBy('sort')
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'parent_id'])
      ->map(fn (AutoCharacteristic $characteristic) => [
        'id' => $characteristic->id,
        'label' => $characteristic->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string}>
   */
  private function searchOptions(?string $query, array $filters, int $limit): Collection
  {
    return AutoOption::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $id) => $q->where('id', $id))
      ->when($filters['exclude_id'] ?? null, fn (Builder $q, $excludeId) => $q->where('id', '!=', $excludeId))
      ->when(array_key_exists('parent_id', $filters) && $filters['parent_id'] !== null, fn (Builder $q) => $q->where('parent_id', $filters['parent_id']))
      ->when($query, fn (Builder $q) => $q->where('name', 'like', "%{$query}%"))
      ->orderBy('sort')
      ->orderBy('name')
      ->limit($limit)
      ->get(['id', 'name', 'parent_id'])
      ->map(fn (AutoOption $option) => [
        'id' => $option->id,
        'label' => $option->name,
      ])
      ->values();
  }

  /**
   * @param  array<string, mixed>  $filters
   * @return Collection<int, array{id: int, label: string, optionLabel?: string}>
   */
  private function searchCountries(?string $query, array $filters, int $limit): Collection
  {
    return Country::query()
      ->when($filters['id'] ?? null, fn (Builder $q, $code) => $q->where('code', $code))
      ->when($filters['name'] ?? null, fn (Builder $q, $name) => $q->where('name', $name))
      ->when($query, fn (Builder $q) => $q->where('name', 'like', "%{$query}%"))
      ->orderBy('name')
      ->limit($limit)
      ->get(['code', 'name'])
      ->map(fn (Country $country) => [
        'id' => $country->code,
        'label' => $country->name,
      ])
      ->values();
  }

  private function formatGenerationOptionLabel(AutoGeneration $generation): string
  {
    $name = trim((string) $generation->name) !== '' ? $generation->name : 'I';
    $years = $this->formatYearRange($generation->year_from, $generation->year_to);

    return trim("{$name} {$years}");
  }

  private function formatYearRange(?int $from, ?int $to): string
  {
    if ($from && $to) {
      return "{$from} - {$to}";
    }

    if ($from) {
      return "{$from} -";
    }

    if ($to) {
      return "- {$to}";
    }

    return '';
  }
}
