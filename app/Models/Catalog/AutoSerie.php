<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoSerie extends Model
{
  public $timestamps = false;

  protected $table = 'auto_series';

  protected $fillable = [
    'model_id',
    'generation_id',
    'name',
    'url',
    'image',
    'status',
  ];

  protected function casts(): array
  {
    return [
      'status' => 'boolean',
    ];
  }

  public function model(): BelongsTo
  {
    return $this->belongsTo(AutoModel::class, 'model_id');
  }

  public function generation(): BelongsTo
  {
    return $this->belongsTo(AutoGeneration::class, 'generation_id');
  }

  public function modifications(): HasMany
  {
    return $this->hasMany(AutoModification::class, 'series_id');
  }

  public function equipments(): HasMany
  {
    return $this->hasMany(AutoEquipment::class, 'series_id');
  }
}
