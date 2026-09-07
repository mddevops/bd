<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Catalog\AutoCharacteristic;
use App\Models\Catalog\AutoEquipment;
use App\Models\Catalog\AutoGeneration;
use App\Models\Catalog\AutoMark;
use App\Models\Catalog\AutoModel;
use App\Models\Catalog\AutoModification;
use App\Models\Catalog\AutoOption;
use App\Models\Catalog\AutoSerie;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
  public function index(): Response
  {
    return Inertia::render('catalog/index', [
      'stats' => [
        'marks' => AutoMark::query()->count(),
        'models' => AutoModel::query()->count(),
        'generations' => AutoGeneration::query()->count(),
        'series' => AutoSerie::query()->count(),
        'modifications' => AutoModification::query()->count(),
        'equipments' => AutoEquipment::query()->count(),
        'characteristics' => AutoCharacteristic::query()->count(),
        'options' => AutoOption::query()->count(),
      ],
    ]);
  }
}
