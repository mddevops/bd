<?php

namespace App\Models\Catalog;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutoOption extends Model
{
  public $timestamps = false;

  protected $fillable = [
    'name',
    'parent_id',
    'sort',
  ];

  public function parent(): BelongsTo
  {
    return $this->belongsTo(self::class, 'parent_id');
  }

  public function children(): HasMany
  {
    return $this->hasMany(self::class, 'parent_id')->orderBy('sort');
  }

  public function optionValues(): HasMany
  {
    return $this->hasMany(AutoOptionValue::class, 'option_id');
  }
}
