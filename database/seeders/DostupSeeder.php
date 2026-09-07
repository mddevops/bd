<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use App\Services\DostupRegistrator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DostupSeeder extends Seeder
{
  public function run(): void
  {
    $registrator = app(DostupRegistrator::class);
    $registrator->sinhronizirovat();

    $administrator = Rol::query()->firstOrCreate(
      ['name' => 'administrator', 'guard_name' => 'web'],
      [
        'otobrazhaemoe_imya' => 'Администратор',
        'opisanie' => 'Полный доступ ко всем разделам системы',
      ],
    );

    $administrator->syncPermissions($registrator->vsePrava());

    $polzovatel = User::query()->updateOrCreate(
      ['email' => 'admin@crm.local'],
      [
        'name' => 'Администратор',
        'password' => Hash::make('password'),
        'aktiven' => true,
        'email_verified_at' => now(),
      ],
    );

    $polzovatel->syncRoles([$administrator->name]);
  }
}
