<?php

namespace App\Http\Controllers;

use App\Enums\UsedCarServiceStatus;
use App\Enums\UsedCarServiceType;
use App\Http\Requests\UsedCars\BulkUsedCarIdsRequest;
use App\Http\Requests\UsedCars\StoreUsedCarRequest;
use App\Http\Requests\UsedCars\UpdateUsedCarRequest;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\Color;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\UsedCarStatus;
use App\Models\Dictionaries\WheelType;
use App\Models\UsedCars\UsedCar;
use App\Services\ActivityHistoryService;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class UsedCarController extends Controller
{
  public function __construct(
    private readonly CatalogSelectService $selects,
    private readonly ActivityHistoryService $activityHistory,
  ) {}

  public function index(Request $request): Response
  {
    return Inertia::render('used-cars/index', $this->indexProps($request));
  }

  public function create(Request $request): Response
  {
    return Inertia::render('used-cars/index', [
      ...$this->indexProps($request),
      'formMode' => 'create',
    ]);
  }

  public function store(StoreUsedCarRequest $request): RedirectResponse
  {
    DB::transaction(function () use ($request) {
      $data = $request->safe()->except(['services', 'manager_id']);
      $data['manager_id'] = $request->user()?->id;
      $data['owner_count'] = max(1, (int) ($data['owner_count'] ?? 1));

      $car = UsedCar::query()->create($data);
      $this->syncServices($car, $request->input('services', []));
    });

    return redirect()
      ->route('used-cars.index')
      ->with('status', 'Автомобиль добавлен');
  }

  public function edit(Request $request, UsedCar $usedCar): Response
  {
    return $this->openForm($request, $usedCar, 'edit');
  }

  public function show(Request $request, UsedCar $usedCar): Response
  {
    $mode = $request->user()?->can('used_cars.update') ? 'edit' : 'view';

    return $this->openForm($request, $usedCar, $mode);
  }

  public function carFormData(Request $request, int $usedCar): JsonResponse
  {
    $model = $this->findUsedCarForForm($request, $usedCar);
    $model->load(['services', 'mark:id,name', 'model:id,name']);
    $this->activityHistory->logViewed($model, $request->user());

    $mode = $model->trashed()
      ? 'view'
      : ($request->user()?->can('used_cars.update') ? 'edit' : 'view');

    return response()->json([
      'mode' => $mode,
      'car' => $this->serializeCar($model),
    ]);
  }

  public function activities(Request $request, int $usedCar): JsonResponse
  {
    $model = $this->findUsedCarForForm($request, $usedCar);

    return response()->json([
      'activities' => $this->activityHistory->forSubject($model),
    ]);
  }

  public function update(UpdateUsedCarRequest $request, UsedCar $usedCar): RedirectResponse
  {
    DB::transaction(function () use ($request, $usedCar) {
      $data = $request->safe()->except(['services', 'manager_id']);
      $data['owner_count'] = max(1, (int) ($data['owner_count'] ?? 1));

      $usedCar->update($data);
      $this->syncServices($usedCar, $request->input('services', []));
    });

    return redirect()
      ->route('used-cars.index')
      ->with('status', 'Автомобиль сохранён');
  }

  public function destroy(UsedCar $usedCar): RedirectResponse
  {
    $this->activityHistory->logDeleted($usedCar, request()->user());
    $usedCar->delete();

    return redirect()
      ->route('used-cars.index')
      ->with('status', 'Автомобиль перемещён в удалённые');
  }

  public function restore(int $usedCar): RedirectResponse
  {
    $model = UsedCar::withTrashed()->findOrFail($usedCar);
    $model->restore();
    $this->activityHistory->logRestored($model, request()->user());

    return redirect()
      ->route('used-cars.index')
      ->with('status', 'Автомобиль восстановлен');
  }

  public function forceDestroy(int $usedCar): RedirectResponse
  {
    $model = UsedCar::withTrashed()->findOrFail($usedCar);
    $this->activityHistory->logForceDeleted($model, request()->user());
    $model->forceDelete();

    return redirect()
      ->route('used-cars.index')
      ->with('status', 'Автомобиль удалён навсегда');
  }

  public function bulkDestroy(BulkUsedCarIdsRequest $request): RedirectResponse
  {
    $cars = UsedCar::query()->whereIn('id', $request->ids())->get();

    foreach ($cars as $car) {
      $this->activityHistory->logDeleted($car, $request->user());
      $car->delete();
    }

    return redirect()
      ->back()
      ->with('status', 'Выбранные автомобили перемещены в удалённые');
  }

  public function bulkRestore(BulkUsedCarIdsRequest $request): RedirectResponse
  {
    $cars = UsedCar::onlyTrashed()->whereIn('id', $request->ids())->get();

    foreach ($cars as $car) {
      $car->restore();
      $this->activityHistory->logRestored($car, $request->user());
    }

    return redirect()
      ->back()
      ->with('status', 'Выбранные автомобили восстановлены');
  }

  public function bulkForceDestroy(BulkUsedCarIdsRequest $request): RedirectResponse
  {
    $cars = UsedCar::onlyTrashed()->whereIn('id', $request->ids())->get();

    foreach ($cars as $car) {
      $this->activityHistory->logForceDeleted($car, $request->user());
      $car->forceDelete();
    }

    return redirect()
      ->back()
      ->with('status', 'Выбранные автомобили удалены навсегда');
  }

  /**
   * @param  'edit'|'view'  $formMode
   */
  private function openForm(Request $request, UsedCar $usedCar, string $formMode): Response
  {
    $usedCar->load(['services', 'mark:id,name', 'model:id,name']);
    $this->activityHistory->logViewed($usedCar, $request->user());

    return Inertia::render('used-cars/index', [
      ...$this->indexProps($request),
      'formMode' => $formMode,
      'editingCar' => $this->serializeCar($usedCar),
    ]);
  }

  private function findUsedCarForForm(Request $request, int $id): UsedCar
  {
    $query = UsedCar::query();

    if ($this->canManageTrash($request)) {
      $query->withTrashed();
    }

    return $query->findOrFail($id);
  }

  private function canManageTrash(Request $request): bool
  {
    $user = $request->user();

    return $user !== null
      && ($user->hasRole('administrator') || $user->can('used_cars.delete'));
  }

  /**
   * @return array<string, mixed>
   */
  private function indexProps(Request $request): array
  {
    $filters = $this->indexFilters($request);

    $cars = DataTable::query(
      UsedCar::query()
        ->when(
          $filters['state']['trashed'] === 'only',
          fn (Builder $query) => $query->onlyTrashed(),
        )
        ->with([
          'mark:id,name',
          'model:id,name',
          'status:id,name,color,text_color',
          'showroom:id,name',
          'bodyType:id,name',
          'transmission:id,name',
          'engineType:id,name',
          'wheelType:id,name',
          'interiorType:id,name',
        ])
        ->withSum('services', 'cost')
        ->when($filters['state']['year_from'], fn (Builder $query, $value) => $query->where('year', '>=', (int) $value))
        ->when($filters['state']['year_to'], fn (Builder $query, $value) => $query->where('year', '<=', (int) $value))
        ->when($filters['state']['mileage_from'], fn (Builder $query, $value) => $query->where('mileage', '>=', (int) $value))
        ->when($filters['state']['mileage_to'], fn (Builder $query, $value) => $query->where('mileage', '<=', (int) $value))
    )
      ->columnDefinitions([
        Column::group(['vin', 'license_plate'])->searchable(),
        Column::make('year')->sortable(),
        Column::make('mileage')->sortable(),
        Column::make('sale_price')->sortable(),
        Column::make('arrival_date')->dateRange()->sortable(),
        Column::make('mark_id')->filterable(),
        Column::make('model_id')->filterable(),
        Column::make('transmission_id')->filterable(),
        Column::make('wheel_type_id')->filterable(),
        Column::make('body_type_id')->filterable(),
        Column::make('engine_type_id')->filterable(),
        Column::make('pts_type')->filterable(),
        Column::make('is_registered')->filterable(),
      ])
      ->applyFilters($filters['expressions'])
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('id', 'desc')
      ->perPage(15)
      ->make()
      ->through(function (UsedCar $car) {
        $servicesCost = (int) ($car->services_sum_cost ?? 0);
        $totalExpenses = $servicesCost
          + (int) $car->transport_cost
          + (int) $car->deregistration_cost
          + (int) $car->repair_cost;

        $ptsLabels = [
          1 => 'ПТС',
          2 => 'Дубликат',
          3 => 'ЭПТС',
        ];

        return [
          'id' => $car->id,
          'arrival_date' => $car->arrival_date?->format('d.m.Y'),
          'showroom' => $car->showroom?->name,
          'mark' => $car->mark?->name,
          'model' => $car->model?->name,
          'year' => $car->year,
          'body_type' => $car->bodyType?->name,
          'owner_count' => $car->owner_count,
          'mileage' => $car->mileage,
          'wheel_type' => $car->wheelType?->name,
          'transmission' => $car->transmission?->name,
          'engine_volume' => $car->engine_volume,
          'power' => $car->power,
          'engine_type' => $car->engineType?->name,
          'interior' => $car->interiorType?->name,
          'color' => $car->color,
          'vin' => $car->vin,
          'license_plate' => $car->license_plate,
          'sts_number' => $car->sts_number,
          'purchase_with_expenses' => (int) $car->purchase_price + $totalExpenses,
          'sale_price' => $car->sale_price,
          'total_expenses' => $totalExpenses,
          'pts_type' => $car->pts_type,
          'pts_label' => $ptsLabels[$car->pts_type] ?? null,
          'is_registered' => $car->is_registered,
          'is_trade_in' => (bool) $car->is_trade_in,
          'key_number' => $car->key_number,
          'legal_entity' => $car->legal_entity,
          'status' => $car->status ? [
            'name' => $car->status->name,
            'color' => $car->status->color,
            'text_color' => $car->status->text_color,
          ] : null,
          'service_book' => $car->service_book,
          'autoteka_url' => $car->autoteka_url,
          'avito_url' => $car->avito_url,
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
      'emptyServices' => $this->emptyServices(),
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
      'mileage_from',
      'mileage_to',
    ];

    $state = [];
    $expressions = [];

    foreach ($intKeys as $key) {
      $raw = $request->string($key)->toString();
      $value = $raw !== '' && ctype_digit($raw) ? (int) $raw : null;
      $state[$key] = $value;

      if ($value === null) {
        continue;
      }

      if (in_array($key, ['year_from', 'year_to', 'mileage_from', 'mileage_to'], true)) {
        continue;
      }

      $expressions[] = "{$key}:{$value}";
    }

    $isRegistered = $request->string('is_registered')->toString();
    $state['is_registered'] = in_array($isRegistered, ['0', '1'], true) ? $isRegistered : null;
    if ($state['is_registered'] !== null) {
      $expressions[] = "is_registered:{$state['is_registered']}";
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

    $trashed = $request->string('trashed')->toString();
    $state['trashed'] = $this->canManageTrash($request) && $trashed === 'only' ? 'only' : null;

    return [
      'expressions' => $expressions,
      'state' => $state,
    ];
  }

  /**
   * @return list<array{type: string, label: string, status: int, cost: null, comment: null}>
   */
  private function emptyServices(): array
  {
    return collect(UsedCarServiceType::cases())->map(fn (UsedCarServiceType $type) => [
      'type' => $type->value,
      'label' => $type->label(),
      'status' => UsedCarServiceStatus::Empty->value,
      'cost' => null,
      'comment' => null,
    ])->values()->all();
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
        'interiorTypes' => InteriorType::query()->ordered()->get(['id', 'name']),
        'statuses' => UsedCarStatus::query()->ordered()->get(['id', 'name', 'color']),
      ],
      'serviceTypes' => UsedCarServiceType::options(),
      'serviceStatuses' => UsedCarServiceStatus::options(),
      'ptsTypes' => [
        ['value' => 1, 'label' => 'ПТС'],
        ['value' => 2, 'label' => 'Дубликат'],
        ['value' => 3, 'label' => 'ЭПТС'],
      ],
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function serializeCar(UsedCar $car): array
  {
    $servicesByType = $car->services->keyBy(fn ($service) => $service->type->value);

    $services = collect(UsedCarServiceType::cases())->map(function (UsedCarServiceType $type) use ($servicesByType) {
      $row = $servicesByType->get($type->value);

      return [
        'type' => $type->value,
        'label' => $type->label(),
        'status' => $row?->status?->value ?? UsedCarServiceStatus::Empty->value,
        'cost' => $row?->cost,
        'comment' => $row?->comment,
      ];
    })->values()->all();

    return [
      'id' => $car->id,
      'showroom_id' => $car->showroom_id,
      'arrival_date' => $car->arrival_date?->format('Y-m-d'),
      'mark_id' => $car->mark_id,
      'model_id' => $car->model_id,
      'year' => $car->year,
      'body_type_id' => $car->body_type_id,
      'transmission_id' => $car->transmission_id,
      'engine_type_id' => $car->engine_type_id,
      'wheel_type_id' => $car->wheel_type_id,
      'color' => $car->color,
      'interior_type_id' => $car->interior_type_id,
      'owner_count' => $car->owner_count,
      'power' => $car->power,
      'mileage' => $car->mileage,
      'engine_volume' => $car->engine_volume,
      'vin' => $car->vin,
      'license_plate' => $car->license_plate,
      'sts_number' => $car->sts_number,
      'pts_type' => $car->pts_type,
      'is_registered' => $car->is_registered,
      'key_number' => $car->key_number,
      'legal_entity' => $car->legal_entity,
      'service_book' => $car->service_book,
      'is_trade_in' => $car->is_trade_in,
      'status_id' => $car->status_id,
      'manager_id' => $car->manager_id,
      'purchase_price' => $car->purchase_price,
      'sale_price' => $car->sale_price,
      'avito_price' => $car->avito_price,
      'repair_cost' => $car->repair_cost,
      'transport_cost' => $car->transport_cost,
      'deregistration_cost' => $car->deregistration_cost,
      'avito_url' => $car->avito_url,
      'autoteka_url' => $car->autoteka_url,
      'sale_type' => $car->sale_type,
      'comment' => $car->comment,
      'services' => $services,
      'purchase_price_with_expenses' => $car->purchasePriceWithExpenses(),
      'total_expenses' => $car->totalExpenses(),
      'is_trashed' => $car->trashed(),
      'selected' => [
        'mark' => $car->mark ? ['id' => $car->mark->id, 'label' => $car->mark->name] : null,
        'model' => $car->model ? ['id' => $car->model->id, 'label' => $car->model->name] : null,
      ],
    ];
  }

  /**
   * @param  list<array<string, mixed>>  $services
   */
  private function syncServices(UsedCar $car, array $services): void
  {
    $keepTypes = [];

    foreach ($services as $service) {
      $type = $service['type'] ?? null;
      if (! $type) {
        continue;
      }

      $keepTypes[] = $type;

      $car->services()->updateOrCreate(
        ['type' => $type],
        [
          'status' => $service['status'] ?? UsedCarServiceStatus::Empty->value,
          'cost' => $service['cost'] ?? null,
          'comment' => $service['comment'] ?? null,
        ],
      );
    }

    if ($keepTypes !== []) {
      $car->services()->whereNotIn('type', $keepTypes)->delete();
    }
  }
}
