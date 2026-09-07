<?php

namespace App\Models\Dictionaries;

use App\Models\Dictionaries\Concerns\HasDictionaryOrdering;
use Illuminate\Database\Eloquent\Model;

class EngineType extends Model
{
  use HasDictionaryOrdering;

  protected $fillable = [
    'ordering',
    'name',
    'comment',
  ];
}
