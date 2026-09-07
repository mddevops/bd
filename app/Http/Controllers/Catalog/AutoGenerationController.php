<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ResolvesCatalogHierarchy;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoGenerationRequest;
use App\Models\Catalog\AutoGeneration;
use App\Models\Catalog\AutoModel;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoGenerationController extends Controller
{
  use InteractsWithCatalogTable;
  use ResolvesCatalogHierarchy;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $filters = $this->catalogFilters($request, ['mark_id', 'model_id']);

    $generations = DataTable::query(
      AutoGeneration::query()
        ->with('model.mark:id,name')
        ->when($filters['mark_id'], fn ($query) => $query->whereHas('model', fn ($model) => $model->where('mark_id', $filters['mark_id'])))
        ->when($filters['model_id'], fn ($query) => $query->where('model_id', $filters['model_id']))
    )
      ->columnDefinitions([
        Column::make('name')->searchable()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('name', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoGeneration $generation) => [
        'id' => $generation->id,
        'name' => $generation->name,
        'year_from' => $generation->year_from,
        'year_to' => $generation->year_to,
        'model' => $generation->model?->name,
        'mark' => $generation->model?->mark?->name,
      ]);

    return Inertia::render('catalog/generations/index', [
      'generations' => $generations,
      'state' => $this->catalogTableState($request),
      'filters' => $filters,
      'selectedMark' => $filters['mark_id'] ? $this->selects->find('marks', $filters['mark_id']) : null,
      'selectedModel' => $filters['model_id'] ? $this->selects->find('models', $filters['model_id']) : null,
    ]);
  }

  public function create(Request $request): Response
  {
    return Inertia::render('catalog/generations/create', $this->formData($request));
  }

  public function store(StoreAutoGenerationRequest $request): RedirectResponse
  {
    AutoGeneration::query()->create([
      'model_id' => $request->integer('model_id'),
      'name' => $request->string('name')->toString(),
      'year_from' => $request->input('year_from'),
      'year_to' => $request->input('year_to'),
    ]);

    return to_route('catalog.generations.index', ['model_id' => $request->integer('model_id')])
      ->with('status', 'Поколение добавлено.');
  }

  public function edit(Request $request, AutoGeneration $generation): Response
  {
    return Inertia::render('catalog/generations/edit', [
      ...$this->formData($request, $generation->model_id),
      'generation' => [
        'id' => $generation->id,
        'model_id' => $generation->model_id,
        'name' => $generation->name,
        'year_from' => $generation->year_from,
        'year_to' => $generation->year_to,
      ],
    ]);
  }

  public function update(StoreAutoGenerationRequest $request, AutoGeneration $generation): RedirectResponse
  {
    $generation->update([
      'model_id' => $request->integer('model_id'),
      'name' => $request->string('name')->toString(),
      'year_from' => $request->input('year_from'),
      'year_to' => $request->input('year_to'),
    ]);

    return to_route('catalog.generations.index', ['model_id' => $generation->model_id])
      ->with('status', 'Поколение обновлено.');
  }

  public function destroy(AutoGeneration $generation): RedirectResponse
  {
    $modelId = $generation->model_id;
    $generation->delete();

    return to_route('catalog.generations.index', ['model_id' => $modelId])
      ->with('status', 'Поколение удалено.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(Request $request, ?int $modelId = null): array
  {
    $modelId = $modelId ?: ($request->integer('model_id') ?: null);
    $markId = $request->integer('mark_id') ?: null;

    if ($modelId && ! $markId) {
      $markId = AutoModel::query()->whereKey($modelId)->value('mark_id');
    }

    return $this->catalogHierarchyFormData(
      $this->selects,
      markId: $markId,
      modelId: $modelId,
    );
  }
}
