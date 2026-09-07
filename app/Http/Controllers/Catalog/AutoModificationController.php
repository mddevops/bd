<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ResolvesCatalogHierarchy;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoModificationRequest;
use App\Models\Catalog\AutoModification;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoModificationController extends Controller
{
  use InteractsWithCatalogTable;
  use ResolvesCatalogHierarchy;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $filters = $this->catalogFilters($request, ['mark_id', 'model_id', 'generation_id', 'series_id']);

    $modifications = DataTable::query(
      AutoModification::query()
        ->with('series.model.mark:id,name')
        ->when($filters['series_id'], fn ($query) => $query->where('series_id', $filters['series_id']))
        ->when($filters['generation_id'], fn ($query) => $query->whereHas('series', fn ($series) => $series->where('generation_id', $filters['generation_id'])))
        ->when($filters['model_id'], fn ($query) => $query->whereHas('series', fn ($series) => $series->where('model_id', $filters['model_id'])))
        ->when($filters['mark_id'], fn ($query) => $query->whereHas('series.model', fn ($model) => $model->where('mark_id', $filters['mark_id'])))
    )
      ->columnDefinitions([
        Column::make('name')->searchable()->sortable(),
        Column::make('engine_power')->sortable(),
        Column::make('status')->filterable()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('name', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoModification $modification) => [
        'id' => $modification->id,
        'name' => $modification->name,
        'engine_volume' => $modification->engine_volume,
        'engine_power' => $modification->engine_power,
        'engine' => $modification->engine,
        'transmission' => $modification->transmission,
        'drive' => $modification->drive,
        'status' => $modification->status,
        'series' => $modification->series?->name,
        'model' => $modification->series?->model?->name,
        'mark' => $modification->series?->model?->mark?->name,
      ]);

    return Inertia::render('catalog/modifications/index', [
      'modifications' => $modifications,
      'state' => $this->catalogTableState($request),
      'filters' => $filters,
      'selectedMark' => $filters['mark_id'] ? $this->selects->find('marks', $filters['mark_id']) : null,
      'selectedModel' => $filters['model_id'] ? $this->selects->find('models', $filters['model_id']) : null,
      'selectedGeneration' => $filters['generation_id'] ? $this->selects->find('generations', $filters['generation_id']) : null,
      'selectedSeries' => $filters['series_id'] ? $this->selects->find('series', $filters['series_id']) : null,
    ]);
  }

  public function create(Request $request): Response
  {
    return Inertia::render('catalog/modifications/create', $this->formData($request));
  }

  public function store(StoreAutoModificationRequest $request): RedirectResponse
  {
    AutoModification::query()->create([
      'series_id' => $request->integer('series_id'),
      'name' => $request->string('name')->toString(),
      'engine_volume' => $request->input('engine_volume'),
      'engine_power' => $request->input('engine_power'),
      'engine' => $request->string('engine')->toString() ?: null,
      'transmission' => $request->string('transmission')->toString() ?: null,
      'drive' => $request->string('drive')->toString() ?: null,
      'consumption_100_km' => $request->input('consumption_100_km'),
      'acceleration_0_100' => $request->input('acceleration_0_100'),
      'status' => $request->boolean('status'),
    ]);

    return to_route('catalog.modifications.index', ['series_id' => $request->integer('series_id')])
      ->with('status', 'Модификация добавлена.');
  }

  public function edit(Request $request, AutoModification $modification): Response
  {
    return Inertia::render('catalog/modifications/edit', [
      ...$this->formData($request, $modification->series_id),
      'modification' => [
        'id' => $modification->id,
        'series_id' => $modification->series_id,
        'name' => $modification->name,
        'engine_volume' => $modification->engine_volume,
        'engine_power' => $modification->engine_power,
        'engine' => $modification->engine,
        'transmission' => $modification->transmission,
        'drive' => $modification->drive,
        'consumption_100_km' => $modification->consumption_100_km,
        'acceleration_0_100' => $modification->acceleration_0_100,
        'status' => $modification->status,
      ],
    ]);
  }

  public function update(StoreAutoModificationRequest $request, AutoModification $modification): RedirectResponse
  {
    $modification->update([
      'series_id' => $request->integer('series_id'),
      'name' => $request->string('name')->toString(),
      'engine_volume' => $request->input('engine_volume'),
      'engine_power' => $request->input('engine_power'),
      'engine' => $request->string('engine')->toString() ?: null,
      'transmission' => $request->string('transmission')->toString() ?: null,
      'drive' => $request->string('drive')->toString() ?: null,
      'consumption_100_km' => $request->input('consumption_100_km'),
      'acceleration_0_100' => $request->input('acceleration_0_100'),
      'status' => $request->boolean('status'),
    ]);

    return to_route('catalog.modifications.index', ['series_id' => $modification->series_id])
      ->with('status', 'Модификация обновлена.');
  }

  public function destroy(AutoModification $modification): RedirectResponse
  {
    $seriesId = $modification->series_id;
    $modification->delete();

    return to_route('catalog.modifications.index', ['series_id' => $seriesId])
      ->with('status', 'Модификация удалена.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(Request $request, ?int $seriesId = null): array
  {
    $seriesId = $seriesId ?: ($request->integer('series_id') ?: null);

    return $this->catalogHierarchyFormData(
      $this->selects,
      markId: $request->integer('mark_id') ?: null,
      modelId: $request->integer('model_id') ?: null,
      generationId: $request->integer('generation_id') ?: null,
      seriesId: $seriesId,
    );
  }
}
