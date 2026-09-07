<?php

namespace App\Console\Commands;

use App\Services\DostupRegistrator;
use Illuminate\Console\Command;

class SinhronizirovatDostupy extends Command
{
  protected $signature = 'dostupy:sync';

  protected $description = 'Синхронизировать права доступа из config/dostupy.php';

  public function handle(DostupRegistrator $registrator): int
  {
    $rezultat = $registrator->sinhronizirovat();

    $this->info("Синхронизация завершена: {$rezultat['sozdano']} новых, всего {$rezultat['vsego']} прав.");

    return self::SUCCESS;
  }
}
