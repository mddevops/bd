<?php

namespace App\Models\UsedCars;

use App\Models\Catalog\AutoMark;
use App\Models\Catalog\AutoModel;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\UsedCarStatus;
use App\Models\Dictionaries\WheelType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class UsedCar extends Model
{
  use LogsActivity {
    shouldLogEvent as protected activitylogShouldLogEvent;
  }
  use SoftDeletes;

  /** @var list<string> */
  protected static array $recordEvents = ['created', 'updated'];

  protected function shouldLogEvent(string $eventName): bool
  {
    if (! app(\App\Services\ActivityHistoryService::class)->allows($eventName)) {
      return false;
    }

    return $this->activitylogShouldLogEvent($eventName);
  }

  protected $fillable = [
    'showroom_id',
    'arrival_date',
    'mark_id',
    'model_id',
    'year',
    'body_type_id',
    'transmission_id',
    'engine_type_id',
    'wheel_type_id',
    'color',
    'interior_type_id',
    'owner_count',
    'power',
    'mileage',
    'engine_volume',
    'vin',
    'license_plate',
    'sts_number',
    'pts_type',
    'is_registered',
    'key_number',
    'legal_entity',
    'service_book',
    'is_trade_in',
    'status_id',
    'manager_id',
    'purchase_price',
    'sale_price',
    'avito_price',
    'repair_cost',
    'transport_cost',
    'deregistration_cost',
    'avito_url',
    'autoteka_url',
    'sale_type',
    'comment',
    'pictures',
  ];

  protected function casts(): array
  {
    return [
      'arrival_date' => 'date',
      'is_registered' => 'boolean',
      'service_book' => 'boolean',
      'is_trade_in' => 'boolean',
      'pictures' => 'array',
      'year' => 'integer',
      'owner_count' => 'integer',
      'power' => 'integer',
      'mileage' => 'integer',
      'pts_type' => 'integer',
      'purchase_price' => 'integer',
      'sale_price' => 'integer',
      'avito_price' => 'integer',
      'repair_cost' => 'integer',
      'transport_cost' => 'integer',
      'deregistration_cost' => 'integer',
    ];
  }

  public function showroom(): BelongsTo
  {
    return $this->belongsTo(Showroom::class);
  }

  public function mark(): BelongsTo
  {
    return $this->belongsTo(AutoMark::class, 'mark_id');
  }

  public function model(): BelongsTo
  {
    return $this->belongsTo(AutoModel::class, 'model_id');
  }

  public function bodyType(): BelongsTo
  {
    return $this->belongsTo(BodyType::class);
  }

  public function transmission(): BelongsTo
  {
    return $this->belongsTo(Transmission::class);
  }

  public function engineType(): BelongsTo
  {
    return $this->belongsTo(EngineType::class);
  }

  public function wheelType(): BelongsTo
  {
    return $this->belongsTo(WheelType::class);
  }

  public function interiorType(): BelongsTo
  {
    return $this->belongsTo(InteriorType::class);
  }

  public function status(): BelongsTo
  {
    return $this->belongsTo(UsedCarStatus::class, 'status_id');
  }

  public function manager(): BelongsTo
  {
    return $this->belongsTo(User::class, 'manager_id');
  }

  public function services(): HasMany
  {
    return $this->hasMany(UsedCarService::class);
  }

  public function getActivitylogOptions(): LogOptions
  {
    return LogOptions::defaults()
      ->useLogName('used-cars')
      ->logFillable()
      ->logExcept(['pictures'])
      ->logOnlyDirty()
      ->dontSubmitEmptyLogs()
      ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
        'created' => 'Создание автомобиля',
        'updated' => 'Изменение автомобиля',
        default => $eventName,
      });
  }

  public function servicesTotalCost(): int
  {
    return (int) $this->services->sum('cost');
  }

  public function purchasePriceWithExpenses(): int
  {
    return (int) $this->purchase_price
      + $this->servicesTotalCost()
      + (int) $this->transport_cost
      + (int) $this->deregistration_cost
      + (int) $this->repair_cost;
  }

  public function totalExpenses(): int
  {
    return $this->servicesTotalCost()
      + (int) $this->transport_cost
      + (int) $this->deregistration_cost
      + (int) $this->repair_cost;
  }
}
