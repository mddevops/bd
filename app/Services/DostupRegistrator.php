<?php

namespace App\Services;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class DostupRegistrator
{
  /**
   * Синхронизировать права из config/dostupy.php с базой данных.
   *
   * @return array{sozdano: int, vsego: int}
   */
  public function sinhronizirovat(): array
  {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $sozdano = 0;

    foreach ($this->vsePrava() as $pravo) {
      $permission = Permission::query()->firstOrCreate(
        ['name' => $pravo, 'guard_name' => 'web'],
      );

      if ($permission->wasRecentlyCreated) {
        $sozdano++;
      }
    }

    return [
      'sozdano' => $sozdano,
      'vsego' => count($this->vsePrava()),
    ];
  }

  /**
   * @return list<string>
   */
  public function vsePrava(): array
  {
    $prava = [];

    foreach (config('dostupy.gruppy', []) as $gruppa) {
      foreach ($gruppa['dostupy'] as $slug => $nazvanie) {
        $prava[] = $slug;
      }
    }

    return array_values(array_unique($prava));
  }

  /**
   * @return array<string, array{nazvanie: string, dostupy: array<string, string>}>
   */
  public function gruppy(): array
  {
    return config('dostupy.gruppy', []);
  }

  /**
   * Группы прав, сгруппированные по категориям для UI назначения роли.
   *
   * @return array<string, array{nazvanie: string, gruppy: array<string, array{nazvanie: string, put: string|null, dostupy: array<string, string>}>}>
   */
  public function kategorii(): array
  {
    $kategorii = config('dostupy.kategorii', []);
    $result = [];

    foreach ($kategorii as $slug => $nazvanie) {
      $result[$slug] = [
        'nazvanie' => $nazvanie,
        'gruppy' => [],
      ];
    }

    foreach (config('dostupy.gruppy', []) as $klyuch => $gruppa) {
      $kategoriya = $gruppa['kategoriya'] ?? 'otdelnye';

      if (! isset($result[$kategoriya])) {
        $result[$kategoriya] = [
          'nazvanie' => $kategoriya,
          'gruppy' => [],
        ];
      }

      $result[$kategoriya]['gruppy'][$klyuch] = [
        'nazvanie' => $gruppa['nazvanie'],
        'put' => $gruppa['put'] ?? null,
        'dostupy' => $gruppa['dostupy'],
      ];
    }

    return $result;
  }
}
