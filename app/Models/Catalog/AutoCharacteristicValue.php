<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoCharacteristicValue extends Model
{
  public $timestamps = false;

  protected $fillable = [
    'equipment_id',
    'characteristic_id',
    'value',
    'unit',
  ];

  public function equipment(): BelongsTo
  {
    return $this->belongsTo(AutoEquipment::class, 'equipment_id');
  }

  public function characteristic(): BelongsTo
  {
    return $this->belongsTo(AutoCharacteristic::class, 'characteristic_id');
  }
}
