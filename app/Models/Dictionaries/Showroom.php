<?php

namespace App\Models\Dictionaries;

use App\Models\Dictionaries\Concerns\HasDictionaryOrdering;
use Illuminate\Database\Eloquent\Model;

class Showroom extends Model
{
  use HasDictionaryOrdering;

  protected $fillable = [
    'ordering',
    'name',
    'code',
    'is_active',
  ];

  protected function casts(): array
  {
    return [
      'is_active' => 'boolean',
    ];
  }
}
