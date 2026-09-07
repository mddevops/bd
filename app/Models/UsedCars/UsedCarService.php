<?php

namespace App\Models\UsedCars;

use App\Enums\UsedCarServiceStatus;
use App\Enums\UsedCarServiceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsedCarService extends Model
{
  protected $fillable = [
    'used_car_id',
    'type',
    'status',
    'cost',
    'comment',
  ];

  protected function casts(): array
  {
    return [
      'type' => UsedCarServiceType::class,
      'status' => UsedCarServiceStatus::class,
      'cost' => 'integer',
    ];
  }

  public function usedCar(): BelongsTo
  {
    return $this->belongsTo(UsedCar::class);
  }
}
