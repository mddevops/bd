<?php

namespace App\Http\Middleware;

use App\Services\SystemSettingsService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $polzovatel = $request->user();
        $systemSettings = SystemSettingsService::forInertia();

        return [
            ...parent::share($request),
            'name' => $systemSettings['appName'],
            'systemSettings' => $systemSettings,
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $polzovatel ? [
                    ...$polzovatel->toArray(),
                    'nastroiki' => $polzovatel->poluchennyeNastroiki(),
                ] : null,
                'prava' => $polzovatel
                    ? $polzovatel->getAllPermissions()->pluck('name')->values()->all()
                    : [],
                'roli' => $polzovatel
                    ? $polzovatel->getRoleNames()->values()->all()
                    : [],
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
