<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoOptionRequest;
use App\Models\Catalog\AutoOption;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoOptionController extends Controller
{
  use InteractsWithCatalogTable;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $options = DataTable::query(
      AutoOption::query()->with('parent:id,name')
    )
      ->columnDefinitions([
        Column::make('name')->searchable()->sortable(),
        Column::make('sort')->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('sort', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (AutoOption $option) => [
        'id' => $option->id,
        'name' => $option->name,
        'sort' => $option->sort,
        'parent' => $option->parent?->name,
      ]);

    return Inertia::render('catalog/options/index', [
      'options' => $options,
      'state' => $this->catalogTableState($request),
    ]);
  }

  public function create(): Response
  {
    return Inertia::render('catalog/options/create');
  }

  public function store(StoreAutoOptionRequest $request): RedirectResponse
  {
    AutoOption::query()->create([
      'name' => $request->string('name')->toString(),
      'parent_id' => $request->input('parent_id'),
      'sort' => $request->integer('sort'),
    ]);

    return to_route('catalog.options.index')->with('status', 'Опция добавлена.');
  }

  public function edit(AutoOption $option): Response
  {
    return Inertia::render('catalog/options/edit', [
      'selectedParent' => $option->parent_id
        ? $this->selects->find('options', $option->parent_id)
        : null,
      'option' => [
        'id' => $option->id,
        'name' => $option->name,
        'parent_id' => $option->parent_id,
        'sort' => $option->sort,
      ],
    ]);
  }

  public function update(StoreAutoOptionRequest $request, AutoOption $option): RedirectResponse
  {
    $option->update([
      'name' => $request->string('name')->toString(),
      'parent_id' => $request->input('parent_id'),
      'sort' => $request->integer('sort'),
    ]);

    return to_route('catalog.options.index')->with('status', 'Опция обновлена.');
  }

  public function destroy(AutoOption $option): RedirectResponse
  {
    $option->delete();

    return to_route('catalog.options.index')->with('status', 'Опция удалена.');
  }
}
