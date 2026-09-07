<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoEquipment extends Model
{
  public $timestamps = false;

  protected $table = 'auto_equipments';

  protected $fillable = [
    'series_id',
    'modification_id',
    'name',
    'status',
  ];

  protected function casts(): array
  {
    return [
      'status' => 'boolean',
    ];
  }

  public function series(): BelongsTo
  {
    return $this->belongsTo(AutoSerie::class, 'series_id');
  }

  public function modification(): BelongsTo
  {
    return $this->belongsTo(AutoModification::class, 'modification_id');
  }

  public function characteristicValues(): HasMany
  {
    return $this->hasMany(AutoCharacteristicValue::class, 'equipment_id');
  }

  public function optionValues(): HasMany
  {
    return $this->hasMany(AutoOptionValue::class, 'equipment_id');
  }
}
