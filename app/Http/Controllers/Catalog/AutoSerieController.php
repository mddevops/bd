<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ResolvesCatalogHierarchy;
use App\Http\Controllers\Catalog\Concerns\StoresCatalogImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoSerieRequest;
use App\Models\Catalog\AutoSerie;
use App\Models\Catalog\AutoModel;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoSerieController extends Controller
{
  use InteractsWithCatalogTable;
  use ResolvesCatalogHierarchy;
  use StoresCatalogImages;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $filters = $this->catalogFilters($request, ['mark_id', 'model_id', 'generation_id']);

    $series = DataTable::query(
      AutoSerie::query()
        ->with(['model.mark:id,name', 'generation:id,name'])
        ->when($filters['mark_id'], fn ($query) => $query->whereHas('model', fn ($model) => $model->where('mark_id', $filters['mark_id'])))
        ->when($filters['model_id'], fn ($query) => $query->where('model_id', $filters['model_id']))
        ->when($filters['generation_id'], fn ($query) => $query->where('generation_id', $filters['generation_id']))
    )
      ->columnDefinitions([
        Column::group(['name', 'url'])->searchable()->sortable(),
        Column::make('status')->filterable()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('name', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoSerie $serie) => [
        'id' => $serie->id,
        'name' => $serie->name,
        'url' => $serie->url,
        'image' => $this->catalogImageUrl($serie->image),
        'status' => $serie->status,
        'model' => $serie->model?->name,
        'mark' => $serie->model?->mark?->name,
        'generation' => $serie->generation?->name,
      ]);

    return Inertia::render('catalog/series/index', [
      'series' => $series,
      'state' => $this->catalogTableState($request),
      'filters' => $filters,
      'selectedMark' => $filters['mark_id'] ? $this->selects->find('marks', $filters['mark_id']) : null,
      'selectedModel' => $filters['model_id'] ? $this->selects->find('models', $filters['model_id']) : null,
      'selectedGeneration' => $filters['generation_id'] ? $this->selects->find('generations', $filters['generation_id']) : null,
    ]);
  }

  public function create(Request $request): Response
  {
    return Inertia::render('catalog/series/create', $this->formData($request));
  }

  public function store(StoreAutoSerieRequest $request): RedirectResponse
  {
    $serie = AutoSerie::query()->create([
      'model_id' => $request->integer('model_id'),
      'generation_id' => $request->integer('generation_id'),
      'name' => $request->string('name')->toString(),
      'url' => $request->string('url')->toString(),
      'image' => null,
      'status' => $request->boolean('status'),
    ]);

    if ($request->file('image')) {
      $serie->update([
        'image' => $this->storeCatalogImage($request->file('image'), 'serie/'.$serie->id),
      ]);
    }

    return to_route('catalog.series.index', [
      'generation_id' => $request->integer('generation_id'),
      'model_id' => $request->integer('model_id'),
    ])->with('status', 'Серия добавлена.');
  }

  public function edit(Request $request, AutoSerie $series): Response
  {
    return Inertia::render('catalog/series/edit', [
      ...$this->formData($request, $series->model_id, $series->generation_id),
      'serie' => [
        'id' => $series->id,
        'model_id' => $series->model_id,
        'generation_id' => $series->generation_id,
        'name' => $series->name,
        'url' => $series->url,
        'image' => $this->catalogImageUrl($series->image),
        'status' => $series->status,
      ],
    ]);
  }

  public function update(StoreAutoSerieRequest $request, AutoSerie $series): RedirectResponse
  {
    $series->update([
      'model_id' => $request->integer('model_id'),
      'generation_id' => $request->integer('generation_id'),
      'name' => $request->string('name')->toString(),
      'url' => $request->string('url')->toString(),
      'image' => $this->storeCatalogImage($request->file('image'), 'serie/'.$series->id, $series->image),
      'status' => $request->boolean('status'),
    ]);

    return to_route('catalog.series.index', [
      'generation_id' => $series->generation_id,
      'model_id' => $series->model_id,
    ])->with('status', 'Серия обновлена.');
  }

  public function destroy(AutoSerie $series): RedirectResponse
  {
    $generationId = $series->generation_id;
    $modelId = $series->model_id;
    $series->delete();

    return to_route('catalog.series.index', [
      'generation_id' => $generationId,
      'model_id' => $modelId,
    ])->with('status', 'Серия удалена.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(Request $request, ?int $modelId = null, ?int $generationId = null): array
  {
    $modelId = $modelId ?: ($request->integer('model_id') ?: null);
    $generationId = $generationId ?: ($request->integer('generation_id') ?: null);
    $markId = $request->integer('mark_id') ?: null;

    if ($modelId && ! $markId) {
      $markId = AutoModel::query()->whereKey($modelId)->value('mark_id');
    }

    return $this->catalogHierarchyFormData(
      $this->selects,
      markId: $markId,
      modelId: $modelId,
      generationId: $generationId,
    );
  }
}
