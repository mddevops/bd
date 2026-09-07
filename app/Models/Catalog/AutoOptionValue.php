<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutoOptionValue extends Model
{
  public $timestamps = false;

  protected $fillable = [
    'option_id',
    'equipment_id',
    'is_base',
  ];

  protected function casts(): array
  {
    return [
      'is_base' => 'boolean',
    ];
  }

  public function option(): BelongsTo
  {
    return $this->belongsTo(AutoOption::class, 'option_id');
  }

  public function equipment(): BelongsTo
  {
    return $this->belongsTo(AutoEquipment::class, 'equipment_id');
  }
}
