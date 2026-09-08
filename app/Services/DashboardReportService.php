<?php

namespace App\Services;

use App\Models\Cars\Car;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\UsedCarStatus;
use App\Models\UsedCars\UsedCar;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardReportService
{
  /**
   * @return array{
   *   cars: array<string, mixed>|null,
   *   used_cars: array<string, mixed>|null,
   * }
   */
  public function build(bool $canCars, bool $canUsedCars): array
  {
    return [
      'cars' => $canCars ? $this->carsReport() : null,
      'used_cars' => $canUsedCars ? $this->usedCarsReport() : null,
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function carsReport(): array
  {
    $now = Carbon::now();
    $monthStart = $now->copy()->startOfMonth()->toDateString();
    $weekStart = $now->copy()->startOfWeek()->toDateString();
    $day30 = $now->copy()->subDays(30)->toDateString();
    $day60 = $now->copy()->subDays(60)->toDateString();

    $soldStatusIds = CarStatus::query()->where('name', 'Продан')->pluck('id');

    $inStock = function () use ($soldStatusIds): Builder {
      return Car::query()->where(function (Builder $query) use ($soldStatusIds) {
        $query->whereNull('status_id');
        if ($soldStatusIds->isNotEmpty()) {
          $query->orWhereNotIn('status_id', $soldStatusIds);
        }
      });
    };

    $sold = fn (): Builder => Car::query()->whereIn('status_id', $soldStatusIds);

    $stockValue = (int) $inStock()->sum('sale_price');
    $avgSalePrice = (int) round((float) ($inStock()->where('sale_price', '>', 0)->avg('sale_price') ?? 0));

    return [
      'title' => 'Новые авто',
      'href' => '/cars',
      'summary' => [
        'total' => Car::query()->count(),
        'in_stock' => $inStock()->count(),
        'sold' => $sold()->count(),
        'sold_this_month' => $sold()->where('updated_at', '>=', $now->copy()->startOfMonth())->count(),
        'arrived_this_month' => Car::query()->whereDate('arrival_date', '>=', $monthStart)->count(),
        'arrived_this_week' => Car::query()->whereDate('arrival_date', '>=', $weekStart)->count(),
        'stock_value' => $stockValue,
        'avg_sale_price' => $avgSalePrice,
        'aging_over_30' => $inStock()->whereNotNull('arrival_date')->whereDate('arrival_date', '<=', $day30)->count(),
        'aging_over_60' => $inStock()->whereNotNull('arrival_date')->whereDate('arrival_date', '<=', $day60)->count(),
        'without_status' => $inStock()->whereNull('status_id')->count(),
      ],
      'by_status' => $this->statusBreakdown(
        Car::query()->select('status_id', DB::raw('count(*) as total'))->groupBy('status_id')->pluck('total', 'status_id'),
        CarStatus::query()->ordered()->get(['id', 'name', 'color', 'text_color']),
        Car::query()->whereNull('status_id')->count(),
      ),
      'by_showroom' => $this->showroomBreakdown('cars'),
      'top_marks' => $this->marksBreakdown('cars'),
      'recent' => Car::query()
        ->with(['mark:id,name', 'model:id,name', 'showroom:id,name', 'status:id,name,color,text_color'])
        ->orderByDesc('arrival_date')
        ->orderByDesc('id')
        ->limit(10)
        ->get()
        ->map(fn (Car $car) => [
          'id' => $car->id,
          'title' => trim(($car->mark?->name ?? '').' '.($car->model?->name ?? '')) ?: 'Без названия',
          'year' => $car->year,
          'showroom' => $car->showroom?->name,
          'arrival_date' => $car->arrival_date?->format('d.m.Y'),
          'sale_price' => $car->sale_price,
          'status' => $car->status ? [
            'name' => $car->status->name,
            'color' => $car->status->color,
            'text_color' => $car->status->text_color,
          ] : null,
        ])
        ->all(),
    ];
  }

  /**
   * @return array<string, mixed>
   */
  private function usedCarsReport(): array
  {
    $now = Carbon::now();
    $monthStart = $now->copy()->startOfMonth()->toDateString();
    $weekStart = $now->copy()->startOfWeek()->toDateString();
    $day30 = $now->copy()->subDays(30)->toDateString();
    $day60 = $now->copy()->subDays(60)->toDateString();

    $soldStatusIds = UsedCarStatus::query()->where('name', 'Продан')->pluck('id');

    $inStock = function () use ($soldStatusIds): Builder {
      return UsedCar::query()->where(function (Builder $query) use ($soldStatusIds) {
        $query->whereNull('status_id');
        if ($soldStatusIds->isNotEmpty()) {
          $query->orWhereNotIn('status_id', $soldStatusIds);
        }
      });
    };

    $sold = fn (): Builder => UsedCar::query()->whereIn('status_id', $soldStatusIds);

    $stockValue = (int) $inStock()->sum('sale_price');
    $purchaseSum = (int) $inStock()->sum('purchase_price');
    $avgSalePrice = (int) round((float) ($inStock()->where('sale_price', '>', 0)->avg('sale_price') ?? 0));
    $avgMileage = (int) round((float) ($inStock()->where('mileage', '>', 0)->avg('mileage') ?? 0));

    return [
      'title' => 'Авто с пробегом',
      'href' => '/used-cars',
      'summary' => [
        'total' => UsedCar::query()->count(),
        'in_stock' => $inStock()->count(),
        'sold' => $sold()->count(),
        'sold_this_month' => $sold()->where('updated_at', '>=', $now->copy()->startOfMonth())->count(),
        'arrived_this_month' => UsedCar::query()->whereDate('arrival_date', '>=', $monthStart)->count(),
        'arrived_this_week' => UsedCar::query()->whereDate('arrival_date', '>=', $weekStart)->count(),
        'stock_value' => $stockValue,
        'avg_sale_price' => $avgSalePrice,
        'avg_mileage' => $avgMileage,
        'trade_in' => $inStock()->where('is_trade_in', true)->count(),
        'potential_margin' => $stockValue - $purchaseSum,
        'aging_over_30' => $inStock()->whereNotNull('arrival_date')->whereDate('arrival_date', '<=', $day30)->count(),
        'aging_over_60' => $inStock()->whereNotNull('arrival_date')->whereDate('arrival_date', '<=', $day60)->count(),
        'without_status' => $inStock()->whereNull('status_id')->count(),
      ],
      'by_status' => $this->statusBreakdown(
        UsedCar::query()->select('status_id', DB::raw('count(*) as total'))->groupBy('status_id')->pluck('total', 'status_id'),
        UsedCarStatus::query()->ordered()->get(['id', 'name', 'color', 'text_color']),
        UsedCar::query()->whereNull('status_id')->count(),
      ),
      'by_showroom' => $this->showroomBreakdown('used_cars'),
      'top_marks' => $this->marksBreakdown('used_cars'),
      'recent' => UsedCar::query()
        ->with(['mark:id,name', 'model:id,name', 'showroom:id,name', 'status:id,name,color,text_color'])
        ->orderByDesc('arrival_date')
        ->orderByDesc('id')
        ->limit(10)
        ->get()
        ->map(fn (UsedCar $car) => [
          'id' => $car->id,
          'title' => trim(($car->mark?->name ?? '').' '.($car->model?->name ?? '')) ?: 'Без названия',
          'year' => $car->year,
          'mileage' => $car->mileage,
          'showroom' => $car->showroom?->name,
          'arrival_date' => $car->arrival_date?->format('d.m.Y'),
          'sale_price' => $car->sale_price,
          'status' => $car->status ? [
            'name' => $car->status->name,
            'color' => $car->status->color,
            'text_color' => $car->status->text_color,
          ] : null,
        ])
        ->all(),
    ];
  }

  /**
   * @param  Collection<int|string, int>  $counts
   * @param  Collection<int, object{id: int, name: string, color: ?string, text_color: ?string}>  $statuses
   * @return list<array{id: int|null, name: string, color: string|null, text_color: string|null, total: int}>
   */
  private function statusBreakdown(Collection $counts, Collection $statuses, int $withoutStatus): array
  {
    $rows = [];

    foreach ($statuses as $status) {
      $total = (int) ($counts[$status->id] ?? 0);
      if ($total === 0) {
        continue;
      }

      $rows[] = [
        'id' => (int) $status->id,
        'name' => $status->name,
        'color' => $status->color,
        'text_color' => $status->text_color,
        'total' => $total,
      ];
    }

    if ($withoutStatus > 0) {
      $rows[] = [
        'id' => null,
        'name' => 'Без статуса',
        'color' => null,
        'text_color' => null,
        'total' => $withoutStatus,
      ];
    }

    usort($rows, fn ($a, $b) => $b['total'] <=> $a['total']);

    return $rows;
  }

  /**
   * @return list<array{name: string, total: int}>
   */
  private function showroomBreakdown(string $table): array
  {
    $showrooms = Showroom::query()->ordered()->get(['id', 'name'])->keyBy('id');

    $counts = DB::table($table)
      ->whereNull('deleted_at')
      ->select('showroom_id', DB::raw('count(*) as total'))
      ->groupBy('showroom_id')
      ->pluck('total', 'showroom_id');

    $rows = [];

    foreach ($counts as $showroomId => $total) {
      $rows[] = [
        'name' => $showroomId ? (string) ($showrooms[$showroomId]->name ?? 'Неизвестный') : 'Без шоурума',
        'total' => (int) $total,
      ];
    }

    usort($rows, fn ($a, $b) => $b['total'] <=> $a['total']);

    return array_slice($rows, 0, 6);
  }

  /**
   * @return list<array{name: string, total: int}>
   */
  private function marksBreakdown(string $table): array
  {
    return DB::table($table)
      ->whereNull($table.'.deleted_at')
      ->join('auto_marks', 'auto_marks.id', '=', $table.'.mark_id')
      ->select('auto_marks.name', DB::raw('count(*) as total'))
      ->groupBy('auto_marks.name')
      ->orderByDesc('total')
      ->limit(5)
      ->get()
      ->map(fn ($row) => [
        'name' => (string) $row->name,
        'total' => (int) $row->total,
      ])
      ->all();
  }
}
