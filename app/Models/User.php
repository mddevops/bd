<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
  /** @use HasFactory<\Database\Factories\UserFactory> */
  use HasFactory, HasRoles, Notifiable;

  protected $fillable = [
    'name',
    'email',
    'password',
    'aktiven',
    'nastroiki',
  ];

  protected $hidden = [
    'password',
    'remember_token',
  ];

  protected function casts(): array
  {
    return [
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'aktiven' => 'boolean',
      'nastroiki' => 'array',
    ];
  }

  /**
   * @return array{tema: string, menyu: string}
   */
  public function poluchennyeNastroiki(): array
  {
    return array_merge([
      'tema' => 'system',
      'menyu' => 'sidebar',
    ], $this->nastroiki ?? []);
  }
}
