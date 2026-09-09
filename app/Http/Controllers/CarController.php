<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cars\BulkCarIdsRequest;
use App\Http\Requests\Cars\StoreCarRequest;
use App\Http\Requests\Cars\UpdateCarRequest;
use App\Models\Cars\Car;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\Color;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\WheelType;
use App\Services\ActivityHistoryService;
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
    private readonly ActivityHistoryService $activityHistory,
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

  public function carFormData(Request $request, int $car): JsonResponse
  {
    $model = $this->findCarForForm($request, $car);
    $model->load(['mark:id,name', 'model:id,name']);
    $this->activityHistory->logViewed($model, $request->user());

    $mode = $model->trashed()
      ? 'view'
      : ($request->user()?->can('cars.update') ? 'edit' : 'view');

    return response()->json([
      'mode' => $mode,
      'car' => $this->serializeCar($model),
    ]);
  }

  public function activities(Request $request, int $car): JsonResponse
  {
    $model = $this->findCarForForm($request, $car);

    return response()->json([
      'activities' => $this->activityHistory->forSubject($model),
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
    $this->activityHistory->logDeleted($car, request()->user());
    $car->delete();

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль перемещён в удалённые');
  }

  public function restore(int $car): RedirectResponse
  {
    $model = Car::withTrashed()->findOrFail($car);
    $model->restore();
    $this->activityHistory->logRestored($model, request()->user());

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль восстановлен');
  }

  public function forceDestroy(int $car): RedirectResponse
  {
    $model = Car::withTrashed()->findOrFail($car);
    $this->activityHistory->logForceDeleted($model, request()->user());
    $model->forceDelete();

    return redirect()
      ->route('cars.index')
      ->with('status', 'Автомобиль удалён навсегда');
  }

  public function bulkDestroy(BulkCarIdsRequest $request): RedirectResponse
  {
    $cars = Car::query()->whereIn('id', $request->ids())->get();

    foreach ($cars as $car) {
      $this->activityHistory->logDeleted($car, $request->user());
      $car->delete();
    }

    return redirect()
      ->back()
      ->with('status', 'Выбранные автомобили перемещены в удалённые');
  }

  public function bulkRestore(BulkCarIdsRequest $request): RedirectResponse
  {
    $cars = Car::onlyTrashed()->whereIn('id', $request->ids())->get();

    foreach ($cars as $car) {
      $car->restore();
      $this->activityHistory->logRestored($car, $request->user());
    }

    return redirect()
      ->back()
      ->with('status', 'Выбранные автомобили восстановлены');
  }

  public function bulkForceDestroy(BulkCarIdsRequest $request): RedirectResponse
  {
    $cars = Car::onlyTrashed()->whereIn('id', $request->ids())->get();

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
  private function openForm(Request $request, Car $car, string $formMode): Response
  {
    $car->load(['mark:id,name', 'model:id,name']);
    $this->activityHistory->logViewed($car, $request->user());

    return Inertia::render('cars/index', [
      ...$this->indexProps($request),
      'formMode' => $formMode,
      'editingCar' => $this->serializeCar($car),
    ]);
  }

  private function findCarForForm(Request $request, int $id): Car
  {
    $query = Car::query();

    if ($this->canManageTrash($request)) {
      $query->withTrashed();
    }

    return $query->findOrFail($id);
  }

  private function canManageTrash(Request $request): bool
  {
    $user = $request->user();

    return $user !== null
      && ($user->hasRole('administrator') || $user->can('cars.delete'));
  }

  /**
   * @return array<string, mixed>
   */
  private function indexProps(Request $request): array
  {
    $filters = $this->indexFilters($request);

    $cars = DataTable::query(
      Car::query()
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
      'avito_url' => $car->avito_url ?: $car->link,
      'autoteka_url' => $car->autoteka_url,
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
      'interior_type_id' => $car->interior_type_id,
      'engine_volume' => $car->engine_volume,
      'vin' => $car->vin,
      'body_number' => $car->body_number,
      'pts_type' => $car->pts_type,
      'price' => $car->price,
      'transport_cost' => $car->transport_cost,
      'repair_cost' => $car->repair_cost,
      'deregistration_cost' => $car->deregistration_cost,
      'sale_price' => $car->sale_price,
      'sell_out' => $car->sell_out,
      'supplier' => $car->supplier,
      'avito_price' => $car->avito_price,
      'key_number' => $car->key_number,
      'status_id' => $car->status_id,
      'transit' => $car->transit,
      'manager_id' => $car->manager_id,
      'comment' => $car->comment,
      'direct' => $car->direct,
      'purchase_price_with_expenses' => $car->purchasePriceWithExpenses(),
      'total_expenses' => $car->totalExpenses(),
      'is_trashed' => $car->trashed(),
      'selected' => [
        'mark' => $car->mark ? ['id' => $car->mark->id, 'label' => $car->mark->name] : null,
        'model' => $car->model ? ['id' => $car->model->id, 'label' => $car->model->name] : null,
      ],
    ];
  }
}
