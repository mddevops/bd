<?php

namespace App\Http\Middleware;

use App\Services\SystemSettingsService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureMaintenanceMode
{
  public function handle(Request $request, Closure $next): Response
  {
    if (! SystemSettingsService::current()->maintenance_mode) {
      return $next($request);
    }

    if ($request->user()?->can('system_settings.manage')) {
      return $next($request);
    }

    if ($request->routeIs('login', 'login.store', 'password.request', 'password.email', 'password.reset', 'password.store')) {
      return $next($request);
    }

    if ($request->expectsJson()) {
      return response()->json(['message' => 'CRM на обслуживании'], 503);
    }

    return Inertia::render('maintenance')
      ->toResponse($request)
      ->setStatusCode(503);
  }
}
