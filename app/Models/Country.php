<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
  public $timestamps = false;

  public $incrementing = false;

  protected $table = 'countries';

  protected $primaryKey = 'code';

  protected $fillable = [
    'code',
    'name',
    'fullname',
    'alpha2',
    'alpha3',
  ];

  protected function casts(): array
  {
    return [
      'code' => 'integer',
    ];
  }
}
