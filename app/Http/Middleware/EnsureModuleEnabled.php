<?php

namespace App\Http\Middleware;

use App\Services\SystemSettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
  public function handle(Request $request, Closure $next, string $module): Response
  {
    if (SystemSettingsService::moduleEnabled($module)) {
      return $next($request);
    }

    abort(404);
  }
}
