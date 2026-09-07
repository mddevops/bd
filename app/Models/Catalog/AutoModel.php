<?php

namespace App\Models\Catalog;

use App\Models\Catalog\Concerns\HasCatalogOrdering;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoModel extends Model
{
  use HasCatalogOrdering;

  public $timestamps = false;

  protected $fillable = [
    'mark_id',
    'name',
    'name_ru',
    'url',
    'class',
    'year_from',
    'year_to',
    'parent_id',
    'status',
    'ordering',
  ];

  protected function casts(): array
  {
    return [
      'status' => 'boolean',
    ];
  }

  public function mark(): BelongsTo
  {
    return $this->belongsTo(AutoMark::class, 'mark_id');
  }

  public function parent(): BelongsTo
  {
    return $this->belongsTo(self::class, 'parent_id');
  }

  public function generations(): HasMany
  {
    return $this->hasMany(AutoGeneration::class, 'model_id');
  }

  public function series(): HasMany
  {
    return $this->hasMany(AutoSerie::class, 'model_id');
  }
}
