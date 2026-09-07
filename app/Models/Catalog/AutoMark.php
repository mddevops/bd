<?php

namespace App\Models\Catalog;

use App\Models\Catalog\Concerns\HasCatalogOrdering;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoMark extends Model
{
  use HasCatalogOrdering;

  public $timestamps = false;

  protected $fillable = [
    'name',
    'name_ru',
    'url',
    'logo_min',
    'logo_big',
    'country',
    'status',
    'ordering',
  ];

  protected function casts(): array
  {
    return [
      'status' => 'boolean',
    ];
  }

  public function models(): HasMany
  {
    return $this->hasMany(AutoModel::class, 'mark_id');
  }

  public function activeModels(): HasMany
  {
    return $this->models()->where('status', true);
  }
}
