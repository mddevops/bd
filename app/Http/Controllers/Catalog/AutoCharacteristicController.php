<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Catalog\Concerns\InteractsWithCatalogTable;
use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\StoreAutoCharacteristicRequest;
use App\Models\Catalog\AutoCharacteristic;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class AutoCharacteristicController extends Controller
{
  use InteractsWithCatalogTable;

  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    $characteristics = DataTable::query(
      AutoCharacteristic::query()->with('parent:id,name')
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
      ->through(fn (AutoCharacteristic $characteristic) => [
        'id' => $characteristic->id,
        'name' => $characteristic->name,
        'sort' => $characteristic->sort,
        'parent' => $characteristic->parent?->name,
      ]);

    return Inertia::render('catalog/characteristics/index', [
      'characteristics' => $characteristics,
      'state' => $this->catalogTableState($request),
    ]);
  }

  public function create(): Response
  {
    return Inertia::render('catalog/characteristics/create');
  }

  public function store(StoreAutoCharacteristicRequest $request): RedirectResponse
  {
    AutoCharacteristic::query()->create([
      'name' => $request->string('name')->toString(),
      'parent_id' => $request->input('parent_id'),
      'sort' => $request->integer('sort'),
    ]);

    return to_route('catalog.characteristics.index')->with('status', 'Характеристика добавлена.');
  }

  public function edit(AutoCharacteristic $characteristic): Response
  {
    return Inertia::render('catalog/characteristics/edit', [
      'selectedParent' => $characteristic->parent_id
        ? $this->selects->find('characteristics', $characteristic->parent_id)
        : null,
      'characteristic' => [
        'id' => $characteristic->id,
        'name' => $characteristic->name,
        'parent_id' => $characteristic->parent_id,
        'sort' => $characteristic->sort,
      ],
    ]);
  }

  public function update(StoreAutoCharacteristicRequest $request, AutoCharacteristic $characteristic): RedirectResponse
  {
    $characteristic->update([
      'name' => $request->string('name')->toString(),
      'parent_id' => $request->input('parent_id'),
      'sort' => $request->integer('sort'),
    ]);

    return to_route('catalog.characteristics.index')->with('status', 'Характеристика обновлена.');
  }

  public function destroy(AutoCharacteristic $characteristic): RedirectResponse
  {
    $characteristic->delete();

    return to_route('catalog.characteristics.index')->with('status', 'Характеристика удалена.');
  }
}
