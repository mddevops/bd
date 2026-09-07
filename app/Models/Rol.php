<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Rol extends SpatieRole
{
  protected $fillable = [
    'name',
    'guard_name',
    'otobrazhaemoe_imya',
    'opisanie',
  ];
}
