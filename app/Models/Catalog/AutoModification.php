<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoModification extends Model
{
  public $timestamps = false;

  protected $fillable = [
    'series_id',
    'name',
    'engine_volume',
    'engine_power',
    'engine',
    'transmission',
    'drive',
    'consumption_100_km',
    'acceleration_0_100',
    'status',
  ];

  protected function casts(): array
  {
    return [
      'status' => 'boolean',
      'engine_volume' => 'decimal:1',
      'consumption_100_km' => 'decimal:1',
      'acceleration_0_100' => 'decimal:1',
    ];
  }

  public function series(): BelongsTo
  {
    return $this->belongsTo(AutoSerie::class, 'series_id');
  }

  public function equipments(): HasMany
  {
    return $this->hasMany(AutoEquipment::class, 'modification_id');
  }
}
