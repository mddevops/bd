<?php

namespace App\Http\Controllers;

use App\Services\DashboardReportService;
use App\Services\SystemSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
  public function __invoke(Request $request, DashboardReportService $reports): Response
  {
    $user = $request->user();
    $modules = SystemSettingsService::forInertia()['modules'];

    $canCars = ($modules['cars'] ?? false) && ($user?->can('cars.view') ?? false);
    $canUsedCars = ($modules['used_cars'] ?? false) && ($user?->can('used_cars.view') ?? false);

    return Inertia::render('dashboard', $reports->build($canCars, $canUsedCars));
  }
}
