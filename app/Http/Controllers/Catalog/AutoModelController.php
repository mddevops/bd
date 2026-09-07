<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ReordersCatalogItems;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\ReorderCatalogRequest;
use App\Http\Requests\Catalog\StoreAutoModelRequest;
use App\Http\Requests\Catalog\UpdateCatalogOrderingRequest;
use App\Models\Catalog\AutoModel;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoModelController extends Controller
{
  use InteractsWithCatalogTable;
  use ReordersCatalogItems;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $filters = $this->catalogFilters($request, ['mark_id']);

    $models = DataTable::query(
      AutoModel::query()
        ->with('mark:id,name')
        ->when($filters['mark_id'], fn ($query) => $query->where('mark_id', $filters['mark_id']))
        ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
        ->orderBy('ordering', 'asc')
        ->orderBy('name', 'asc')
    )
      ->columnDefinitions([
        Column::group(['name', 'name_ru'])->searchable()->sortable(),
        Column::make('ordering')->sortable(),
        Column::make('status')->filterable()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('ordering', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoModel $model) => [
        'id' => $model->id,
        'name' => $model->name,
        'name_ru' => $model->name_ru,
        'url' => $model->url,
        'class' => $model->class,
        'year_from' => $model->year_from,
        'year_to' => $model->year_to,
        'ordering' => ($model->ordering && $model->ordering > 0) ? $model->ordering : null,
        'status' => $model->status,
        'mark' => $model->mark?->name,
      ]);

    return Inertia::render('catalog/models/index', [
      'models' => $models,
      'state' => $this->catalogTableState($request),
      'filters' => $filters,
      'selectedMark' => $filters['mark_id'] ? $this->selects->find('marks', $filters['mark_id']) : null,
    ]);
  }

  public function create(Request $request): Response
  {
    return Inertia::render('catalog/models/create', $this->formData($request));
  }

  public function store(StoreAutoModelRequest $request): RedirectResponse
  {
    AutoModel::query()->create([
      'mark_id' => $request->integer('mark_id'),
      'name' => $request->string('name')->toString(),
      'name_ru' => $request->string('name_ru')->toString() ?: null,
      'url' => $request->string('url')->toString(),
      'class' => $request->string('class')->toString() ?: null,
      'year_from' => $request->input('year_from'),
      'year_to' => $request->input('year_to'),
      'parent_id' => $request->input('parent_id'),
      'status' => $request->boolean('status'),
      'ordering' => AutoModel::normalizeOrdering($request->input('ordering')),
    ]);

    return to_route('catalog.models.index', ['mark_id' => $request->integer('mark_id')])
      ->with('status', 'Модель добавлена.');
  }

  public function edit(Request $request, AutoModel $model): Response
  {
    return Inertia::render('catalog/models/edit', [
      ...$this->formData($request, $model->mark_id, $model->parent_id),
      'model' => [
        'id' => $model->id,
        'mark_id' => $model->mark_id,
        'name' => $model->name,
        'name_ru' => $model->name_ru,
        'url' => $model->url,
        'class' => $model->class,
        'year_from' => $model->year_from,
        'year_to' => $model->year_to,
        'parent_id' => $model->parent_id,
        'ordering' => ($model->ordering && $model->ordering > 0) ? $model->ordering : null,
        'status' => $model->status,
      ],
    ]);
  }

  public function update(StoreAutoModelRequest $request, AutoModel $model): RedirectResponse
  {
    $model->update([
      'mark_id' => $request->integer('mark_id'),
      'name' => $request->string('name')->toString(),
      'name_ru' => $request->string('name_ru')->toString() ?: null,
      'url' => $request->string('url')->toString(),
      'class' => $request->string('class')->toString() ?: null,
      'year_from' => $request->input('year_from'),
      'year_to' => $request->input('year_to'),
      'parent_id' => $request->input('parent_id'),
      'status' => $request->boolean('status'),
      'ordering' => AutoModel::normalizeOrdering($request->input('ordering')),
    ]);

    return to_route('catalog.models.index', ['mark_id' => $model->mark_id])
      ->with('status', 'Модель обновлена.');
  }

  public function destroy(AutoModel $model): RedirectResponse
  {
    $markId = $model->mark_id;
    $model->delete();

    return to_route('catalog.models.index', ['mark_id' => $markId])
      ->with('status', 'Модель удалена.');
  }

  public function reorder(ReorderCatalogRequest $request): RedirectResponse
  {
    $ids = $request->validated('ids');
    $markId = $request->integer('mark_id') ?: null;

    if ($markId) {
      $count = AutoModel::query()
        ->where('mark_id', $markId)
        ->whereIn('id', $ids)
        ->count();

      if ($count !== count($ids)) {
        abort(422, 'Модели не принадлежат выбранной марке.');
      }
    }

    $this->reorderByIds(AutoModel::class, $ids);

    return back();
  }

  public function updateOrdering(UpdateCatalogOrderingRequest $request, AutoModel $model): RedirectResponse
  {
    $model->update([
      'ordering' => AutoModel::normalizeOrdering($request->input('ordering')),
    ]);

    return back();
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(Request $request, ?int $markId = null, ?int $parentId = null): array
  {
    $markId = $markId ?: ($request->integer('mark_id') ?: null);
    $parentId = $parentId ?: ($request->integer('parent_id') ?: null);

    return [
      'defaultMarkId' => $markId,
      'selectedMark' => $markId ? $this->selects->find('marks', $markId) : null,
      'selectedParent' => $parentId ? $this->selects->find('models', $parentId) : null,
    ];
  }
}
