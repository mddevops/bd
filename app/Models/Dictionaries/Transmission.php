<?php

namespace App\Models\Dictionaries;

use App\Models\Dictionaries\Concerns\HasDictionaryOrdering;
use Illuminate\Database\Eloquent\Model;

class Transmission extends Model
{
  use HasDictionaryOrdering;

  protected $fillable = [
    'ordering',
    'name',
  ];
}
