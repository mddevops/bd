<?php

namespace App\Models\Cars;

use App\Models\Catalog\AutoMark;
use App\Models\Catalog\AutoModel;
use App\Models\Dictionaries\BodyType;
use App\Models\Dictionaries\CarStatus;
use App\Models\Dictionaries\EngineType;
use App\Models\Dictionaries\InteriorType;
use App\Models\Dictionaries\Showroom;
use App\Models\Dictionaries\Transmission;
use App\Models\Dictionaries\WheelType;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
  use SoftDeletes;

  protected $fillable = [
    'showroom_id',
    'link',
    'avito_url',
    'autoteka_url',
    'arrival_date',
    'mark_id',
    'model_id',
    'year',
    'complectation',
    'body_type_id',
    'transmission_id',
    'engine_type_id',
    'wheel_type_id',
    'power',
    'salon',
    'color',
    'interior_type_id',
    'engine_volume',
    'vin',
    'body_number',
    'pts_type',
    'price',
    'transport_cost',
    'repair_cost',
    'deregistration_cost',
    'sale_price',
    'sell_out',
    'supplier',
    'avito_price',
    'key_number',
    'status_id',
    'is_sold',
    'transit',
    'manager_id',
    'comment',
    'direct',
    'service_book',
  ];

  protected function casts(): array
  {
    return [
      'arrival_date' => 'date',
      'sell_out' => 'boolean',
      'is_sold' => 'boolean',
      'service_book' => 'boolean',
      'year' => 'integer',
      'power' => 'integer',
      'pts_type' => 'integer',
      'price' => 'integer',
      'transport_cost' => 'integer',
      'repair_cost' => 'integer',
      'deregistration_cost' => 'integer',
      'sale_price' => 'integer',
      'avito_price' => 'integer',
      'transit' => 'integer',
      'direct' => 'integer',
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
    return $this->belongsTo(CarStatus::class, 'status_id');
  }

  public function manager(): BelongsTo
  {
    return $this->belongsTo(User::class, 'manager_id');
  }

  public function totalExpenses(): int
  {
    return (int) $this->transport_cost
      + (int) $this->repair_cost
      + (int) $this->deregistration_cost;
  }

  public function purchasePriceWithExpenses(): int
  {
    return (int) $this->price + $this->totalExpenses();
  }
}
