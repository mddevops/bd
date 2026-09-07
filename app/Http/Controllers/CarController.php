<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cars\StoreCarRequest;
use App\Http\Requests\Cars\UpdateCarRequest;
use App\Models\Cars\Car;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\Color;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\WheelType;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class CarController extends Controller
{
  public function __construct(
    private readonly CatalogSelectService $selects,
  ) {}

  public function index(Request $request): Response
  {
    return Inertia::render('cars/index', $this->indexProps($request));
  }

  public function create(Request $request): Response
  {
    return Inertia::render('cars/index', [
      ...$this->indexProps($request),
      'formMode' => 'create',
    ]);
  }

  public function store(StoreCarRequest $request): RedirectResponse
  {
    $data = $request->safe()->except(['manager_id']);
    $data['manager_id'] = $request->user()?->id;

    Car::query()->create($data);

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль добавлен');
  }

  public function edit(Request $request, Car $car): Response
  {
    return $this->openForm($request, $car, 'edit');
  }

  public function show(Request $request, Car $car): Response
  {
    $mode = $request->user()?->can('cars.update') ? 'edit' : 'view';

    return $this->openForm($request, $car, $mode);
  }

  public function carFormData(Request $request, Car $car): JsonResponse
  {
    $car->load(['mark:id,name', 'model:id,name']);

    return response()->json([
      'mode' => $request->user()?->can('cars.update') ? 'edit' : 'view',
      'car' => $this->serializeCar($car),
    ]);
  }

  public function update(UpdateCarRequest $request, Car $car): RedirectResponse
  {
    $data = $request->safe()->except(['manager_id']);
    $car->update($data);

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль сохранён');
  }

  public function destroy(Car $car): RedirectResponse
  {
    $car->delete();

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль удалён');
  }

  /**
   * @param  'edit'|'view'  $formMode
   */
  private function openForm(Request $request, Car $car, string $formMode): Response
  {
    $car->load(['mark:id,name', 'model:id,name']);

    return Inertia::render('cars/index', [
      ...$this->indexProps($request),
      'formMode' => $formMode,
      'editingCar' => $this->serializeCar($car),
    ]);
  }

  /**
   * @return array<string, mixed>
   */
  private function indexProps(Request $request): array
  {
    $filters = $this->indexFilters($request);

    $cars = DataTable::query(
      Car::query()
        ->with([
          'mark:id,name',
          'model:id,name',
          'status:id,name,color,text_color',
          'showroom:id,name',
          'bodyType:id,name',
          'transmission:id,name',
          'engineType:id,name',
          'wheelType:id,name',
        ])
        ->when($filters['state']['year_from'], fn (Builder $query, $value) => $query->where('year', '>=', (int) $value))
        ->when($filters['state']['year_to'], fn (Builder $query, $value) => $query->where('year', '<=', (int) $value))
    )
      ->columnDefinitions([
        Column::group(['vin', 'body_number'])->searchable(),
        Column::make('year')->sortable(),
        Column::make('sale_price')->sortable(),
        Column::make('price')->sortable(),
        Column::make('arrival_date')->dateRange()->sortable(),
        Column::make('mark_id')->filterable(),
        Column::make('model_id')->filterable(),
        Column::make('transmission_id')->filterable(),
        Column::make('wheel_type_id')->filterable(),
        Column::make('body_type_id')->filterable(),
        Column::make('engine_type_id')->filterable(),
        Column::make('pts_type')->filterable(),
        Column::make('is_sold')->filterable(),
      ])
      ->applyFilters($filters['expressions'])
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('id', 'desc')
      ->perPage(15)
      ->make()
      ->through(function (Car $car) {
        $ptsLabels = [
          0 => 'Нет',
          1 => 'ПТС',
          2 => 'ЭПТС',
        ];

        return [
          'id' => $car->id,
          'arrival_date' => $car->arrival_date?->format('d.m.Y'),
          'showroom' => $car->showroom?->name,
          'mark' => $car->mark?->name,
          'model' => $car->model?->name,
          'year' => $car->year,
          'complectation' => $car->complectation,
          'body_type' => $car->bodyType?->name,
          'wheel_type' => $car->wheelType?->name,
          'transmission' => $car->transmission?->name,
          'engine_volume' => $car->engine_volume,
          'power' => $car->power,
          'engine_type' => $car->engineType?->name,
          'color' => $car->color,
          'vin' => $car->vin,
          'body_number' => $car->body_number,
          'price' => $car->price,
          'sale_price' => $car->sale_price,
          'pts_type' => $car->pts_type,
          'pts_label' => $ptsLabels[$car->pts_type] ?? null,
          'key_number' => $car->key_number,
          'is_sold' => (bool) $car->is_sold,
          'service_book' => $car->service_book,
          'link' => $car->link,
          'status' => $car->status ? [
            'name' => $car->status->name,
            'color' => $car->status->color,
            'text_color' => $car->status->text_color,
          ] : null,
        ];
      });

    $markId = $filters['state']['mark_id'];
    $modelId = $filters['state']['model_id'];

    return [
      'cars' => $cars,
      'state' => [
        'search' => $request->string('search')->toString(),
        'col' => $request->string('col')->toString() ?: null,
        'sort' => $request->string('sort')->toString() ?: null,
        'page' => max(1, (int) $request->input('page', 1)),
        'limit' => max(1, (int) $request->input('limit', 15)),
      ],
      'filters' => $filters['state'],
      'selectedMark' => $markId ? $this->selects->find('marks', $markId) : null,
      'selectedModel' => $modelId ? $this->selects->find('models', $modelId) : null,
      'formMode' => null,
      'editingCar' => null,
      ...$this->formData(),
    ];
  }

  /**
   * @return array{
   *   expressions: list<string>,
   *   state: array<string, string|int|null>
   * }
   */
  private function indexFilters(Request $request): array
  {
    $intKeys = [
      'mark_id',
      'model_id',
      'transmission_id',
      'wheel_type_id',
      'body_type_id',
      'engine_type_id',
      'pts_type',
      'year_from',
      'year_to',
    ];

    $state = [];
    $expressions = [];

    foreach ($intKeys as $key) {
      $raw = $request->string($key)->toString();
      $value = $raw !== '' && ctype_digit($raw) ? (int) $raw : null;
      $state[$key] = $value;

      if ($value === null || in_array($key, ['year_from', 'year_to'], true)) {
        continue;
      }

      $expressions[] = "{$key}:{$value}";
    }

    $isSold = $request->string('is_sold')->toString();
    $state['is_sold'] = in_array($isSold, ['0', '1'], true) ? $isSold : null;
    if ($state['is_sold'] !== null) {
      $expressions[] = "is_sold:{$state['is_sold']}";
    }

    $arrivalFrom = $request->string('arrival_date_from')->toString();
    $arrivalTo = $request->string('arrival_date_to')->toString();
    $state['arrival_date_from'] = $arrivalFrom !== '' ? $arrivalFrom : null;
    $state['arrival_date_to'] = $arrivalTo !== '' ? $arrivalTo : null;

    if ($state['arrival_date_from'] !== null) {
      $expressions[] = "arrival_date_from:{$state['arrival_date_from']}";
    }

    if ($state['arrival_date_to'] !== null) {
      $expressions[] = "arrival_date_to:{$state['arrival_date_to']}";
    }

    return [
      'expressions' => $expressions,
      'state' => $state,
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function formData(): array
  {
    return [
      'dictionaries' => [
        'showrooms' => Showroom::query()->where('is_active', true)->ordered()->get(['id', 'name']),
        'bodyTypes' => BodyType::query()->ordered()->get(['id', 'name']),
        'transmissions' => Transmission::query()->ordered()->get(['id', 'name']),
        'engineTypes' => EngineType::query()->ordered()->get(['id', 'name']),
        'wheelTypes' => WheelType::query()->ordered()->get(['id', 'name']),
        'colors' => Color::query()->ordered()->get(['id', 'name', 'hex']),
        'statuses' => CarStatus::query()->ordered()->get(['id', 'name', 'color']),
      ],
      'ptsTypes' => [
        ['value' => 0, 'label' => 'Нет'],
        ['value' => 1, 'label' => 'ПТС'],
        ['value' => 2, 'label' => 'ЭПТС'],
      ],
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function serializeCar(Car $car): array
  {
    return [
      'id' => $car->id,
      'showroom_id' => $car->showroom_id,
      'link' => $car->link,
      'arrival_date' => $car->arrival_date?->format('Y-m-d'),
      'mark_id' => $car->mark_id,
      'model_id' => $car->model_id,
      'year' => $car->year,
      'complectation' => $car->complectation,
      'body_type_id' => $car->body_type_id,
      'transmission_id' => $car->transmission_id,
      'engine_type_id' => $car->engine_type_id,
      'wheel_type_id' => $car->wheel_type_id,
      'power' => $car->power,
      'salon' => $car->salon,
      'color' => $car->color,
      'engine_volume' => $car->engine_volume,
      'vin' => $car->vin,
      'body_number' => $car->body_number,
      'pts_type' => $car->pts_type,
      'price' => $car->price,
      'transport_cost' => $car->transport_cost,
      'sale_price' => $car->sale_price,
      'sell_out' => $car->sell_out,
      'supplier' => $car->supplier,
      'avito_price' => $car->avito_price,
      'key_number' => $car->key_number,
      'status_id' => $car->status_id,
      'is_sold' => $car->is_sold,
      'transit' => $car->transit,
      'manager_id' => $car->manager_id,
      'comment' => $car->comment,
      'direct' => $car->direct,
      'service_book' => $car->service_book,
      'selected' => [
        'mark' => $car->mark ? ['id' => $car->mark->id, 'label' => $car->mark->name] : null,
        'model' => $car->model ? ['id' => $car->model->id, 'label' => $car->model->name] : null,
      ],
    ];
  }
}
