<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Catalog\Concerns\ReordersCatalogItems;
use App\Http\Controllers\Catalog\Concerns\StoresCatalogImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\BulkAutoMarkRequest;
use App\Http\Requests\Catalog\BulkAutoMarkStatusRequest;
use App\Http\Requests\Catalog\ReorderCatalogRequest;
use App\Http\Requests\Catalog\StoreAutoMarkRequest;
use App\Http\Requests\Catalog\UpdateCatalogOrderingRequest;
use App\Models\Catalog\AutoMark;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoMarkController extends Controller
{
  use InteractsWithCatalogTable;
  use ReordersCatalogItems;
  use StoresCatalogImages;

  public function index(Request $request): Response
  {
    $status = $this->catalogStatusFilter($request);

    $marks = DataTable::query(
      AutoMark::query()
        ->withCount('models')
        ->when($status !== null, fn ($query) => $query->where('status', $status))
        ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
        ->orderBy('ordering', 'asc')
        ->orderBy('name', 'asc')
    )
      ->columnDefinitions([
        Column::group(['name', 'name_ru', 'country'])->searchable()->sortable(),
        Column::make('url')->searchable()->sortable(),
        Column::make('ordering')->sortable(),
        Column::make('status')->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('ordering', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoMark $mark) => [
        'id' => $mark->id,
        'name' => $mark->name,
        'name_ru' => $mark->name_ru,
        'url' => $mark->url,
        'logo_min' => $this->catalogImageUrl($mark->logo_min),
        'country' => $mark->country,
        'ordering' => ($mark->ordering && $mark->ordering > 0) ? $mark->ordering : null,
        'status' => $mark->status,
        'models_count' => $mark->models_count,
      ]);

    return Inertia::render('catalog/marks/index', [
      'marks' => $marks,
      'state' => $this->catalogTableState($request),
      'filters' => [
        'status' => $status,
      ],
    ]);
  }

  public function create(): Response
  {
    return Inertia::render('catalog/marks/create');
  }

  public function store(StoreAutoMarkRequest $request): RedirectResponse
  {
    $url = $request->string('url')->toString();

    AutoMark::query()->create([
      'name' => $request->string('name')->toString(),
      'name_ru' => $request->string('name_ru')->toString() ?: null,
      'url' => $url,
      'logo_min' => $this->storeCatalogImage($request->file('logo_min'), 'mark_small', null, $url),
      'logo_big' => $this->storeCatalogImage($request->file('logo_big'), 'mark_big', null, $url),
      'country' => $request->string('country')->toString() ?: null,
      'status' => $request->boolean('status'),
      'ordering' => AutoMark::normalizeOrdering($request->input('ordering')),
    ]);

    return to_route('catalog.marks.index')->with('status', 'Марка добавлена.');
  }

  public function edit(AutoMark $mark): Response
  {
    return Inertia::render('catalog/marks/edit', [
      'mark' => [
        'id' => $mark->id,
        'name' => $mark->name,
        'name_ru' => $mark->name_ru,
        'url' => $mark->url,
        'logo_min' => $this->catalogImageUrl($mark->logo_min),
        'logo_big' => $this->catalogImageUrl($mark->logo_big),
        'country' => $mark->country,
        'ordering' => ($mark->ordering && $mark->ordering > 0) ? $mark->ordering : null,
        'status' => $mark->status,
      ],
    ]);
  }

  public function update(StoreAutoMarkRequest $request, AutoMark $mark): RedirectResponse
  {
    $url = $request->string('url')->toString();

    $mark->update([
      'name' => $request->string('name')->toString(),
      'name_ru' => $request->string('name_ru')->toString() ?: null,
      'url' => $url,
      'logo_min' => $this->storeCatalogImage($request->file('logo_min'), 'mark_small', $mark->logo_min, $url),
      'logo_big' => $this->storeCatalogImage($request->file('logo_big'), 'mark_big', $mark->logo_big, $url),
      'country' => $request->string('country')->toString() ?: null,
      'status' => $request->boolean('status'),
      'ordering' => AutoMark::normalizeOrdering($request->input('ordering')),
    ]);

    return to_route('catalog.marks.index')->with('status', 'Марка обновлена.');
  }

  public function destroy(AutoMark $mark): RedirectResponse
  {
    $mark->delete();

    return to_route('catalog.marks.index')->with('status', 'Марка удалена.');
  }

  public function reorder(ReorderCatalogRequest $request): RedirectResponse
  {
    $this->reorderByIds(AutoMark::class, $request->validated('ids'));

    return back();
  }

  public function updateOrdering(UpdateCatalogOrderingRequest $request, AutoMark $mark): RedirectResponse
  {
    $mark->update([
      'ordering' => AutoMark::normalizeOrdering($request->input('ordering')),
    ]);

    return back();
  }

  public function bulkUpdateStatus(BulkAutoMarkStatusRequest $request): RedirectResponse
  {
    AutoMark::query()
      ->whereIn('id', $request->ids())
      ->update(['status' => $request->boolean('status')]);

    return back()->with('status', 'Статус выбранных марок обновлён.');
  }

  public function bulkDestroy(BulkAutoMarkRequest $request): RedirectResponse
  {
    AutoMark::query()->whereIn('id', $request->ids())->delete();

    return back()->with('status', 'Выбранные марки удалены.');
  }

  public function export(Request $request): HttpResponse
  {
    $ids = collect($request->input('ids', []))
      ->map(fn ($id) => (int) $id)
      ->filter(fn ($id) => $id > 0)
      ->values()
      ->all();

    $marks = AutoMark::query()
      ->when($ids !== [], fn ($query) => $query->whereIn('id', $ids))
      ->orderBy('name')
      ->get(['id', 'name', 'name_ru', 'url', 'country', 'ordering', 'status']);

    $lines = [
      ['ID', 'Название', 'Название (RU)', 'URL', 'Страна', 'Порядок', 'Статус'],
    ];

    foreach ($marks as $mark) {
      $lines[] = [
        $mark->id,
        $mark->name,
        $mark->name_ru,
        $mark->url,
        $mark->country,
        $mark->ordering,
        $mark->status ? 'Активна' : 'Неактивна',
      ];
    }

    $content = "\xEF\xBB\xBF".collect($lines)
      ->map(fn (array $row) => collect($row)->map(fn ($value) => '"'.str_replace('"', '""', (string) ($value ?? '')).'"')->implode(';'))
      ->implode("\n");

    $filename = 'marks-'.now()->format('Y-m-d-His').'.csv';

    return response($content, 200, [
      'Content-Type' => 'text/csv; charset=UTF-8',
      'Content-Disposition' => 'attachment; filename="'.$filename.'"',
    ]);
  }
}
