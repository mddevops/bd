<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ResolvesCatalogHierarchy;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoEquipmentRequest;
use App\Models\Catalog\AutoEquipment;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoEquipmentController extends Controller
{
  use InteractsWithCatalogTable;
  use ResolvesCatalogHierarchy;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $filters = $this->catalogFilters($request, ['mark_id', 'model_id', 'generation_id', 'series_id']);

    $equipments = DataTable::query(
      AutoEquipment::query()
        ->with(['series.model.mark:id,name', 'modification:id,name'])
        ->when($filters['series_id'], fn ($query) => $query->where('series_id', $filters['series_id']))
        ->when($filters['generation_id'], fn ($query) => $query->whereHas('series', fn ($series) => $series->where('generation_id', $filters['generation_id'])))
        ->when($filters['model_id'], fn ($query) => $query->whereHas('series', fn ($series) => $series->where('model_id', $filters['model_id'])))
        ->when($filters['mark_id'], fn ($query) => $query->whereHas('series.model', fn ($model) => $model->where('mark_id', $filters['mark_id'])))
    )
      ->columnDefinitions([
        Column::make('name')->searchable()->sortable(),
        Column::make('status')->filterable()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('name', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoEquipment $equipment) => [
        'id' => $equipment->id,
        'name' => $equipment->name,
        'status' => $equipment->status,
        'series' => $equipment->series?->name,
        'modification' => $equipment->modification?->name,
        'model' => $equipment->series?->model?->name,
        'mark' => $equipment->series?->model?->mark?->name,
      ]);

    return Inertia::render('catalog/equipments/index', [
      'equipments' => $equipments,
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
    return Inertia::render('catalog/equipments/create', $this->formData($request));
  }

  public function store(StoreAutoEquipmentRequest $request): RedirectResponse
  {
    AutoEquipment::query()->create([
      'series_id' => $request->integer('series_id'),
      'modification_id' => $request->integer('modification_id'),
      'name' => $request->string('name')->toString(),
      'status' => $request->boolean('status'),
    ]);

    return to_route('catalog.equipments.index', ['series_id' => $request->integer('series_id')])
      ->with('status', 'Комплектация добавлена.');
  }

  public function edit(Request $request, AutoEquipment $equipment): Response
  {
    return Inertia::render('catalog/equipments/edit', [
      ...$this->formData($request, $equipment->series_id, $equipment->modification_id),
      'equipment' => [
        'id' => $equipment->id,
        'series_id' => $equipment->series_id,
        'modification_id' => $equipment->modification_id,
        'name' => $equipment->name,
        'status' => $equipment->status,
      ],
    ]);
  }

  public function update(StoreAutoEquipmentRequest $request, AutoEquipment $equipment): RedirectResponse
  {
    $equipment->update([
      'series_id' => $request->integer('series_id'),
      'modification_id' => $request->integer('modification_id'),
      'name' => $request->string('name')->toString(),
      'status' => $request->boolean('status'),
    ]);

    return to_route('catalog.equipments.index', ['series_id' => $equipment->series_id])
      ->with('status', 'Комплектация обновлена.');
  }

  public function destroy(AutoEquipment $equipment): RedirectResponse
  {
    $seriesId = $equipment->series_id;
    $equipment->delete();

    return to_route('catalog.equipments.index', ['series_id' => $seriesId])
      ->with('status', 'Комплектация удалена.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(Request $request, ?int $seriesId = null, ?int $modificationId = null): array
  {
    $seriesId = $seriesId ?: ($request->integer('series_id') ?: null);
    $modificationId = $modificationId ?: ($request->integer('modification_id') ?: null);

    return $this->catalogHierarchyFormData(
      $this->selects,
      markId: $request->integer('mark_id') ?: null,
      modelId: $request->integer('model_id') ?: null,
      generationId: $request->integer('generation_id') ?: null,
      seriesId: $seriesId,
      modificationId: $modificationId,
    );
  }
}
