<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoGeneration extends Model
{
  public $timestamps = false;

  protected $fillable = [
    'model_id',
    'name',
    'year_from',
    'year_to',
  ];

  public function model(): BelongsTo
  {
    return $this->belongsTo(AutoModel::class, 'model_id');
  }

  public function series(): HasMany
  {
    return $this->hasMany(AutoSerie::class, 'generation_id');
  }
}
