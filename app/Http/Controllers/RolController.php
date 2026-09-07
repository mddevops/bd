<?php

namespace App\Http\Controllers;

use App\Http\Requests\Rol\SohranitRolRequest;
use App\Models\Rol;
use App\Services\DostupRegistrator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class RolController extends Controller
{
  public function __construct(
    private DostupRegistrator $dostupRegistrator,
  ) {}

  public function index(Request $request): Response
  {
    $roli = DataTable::query(Rol::query())
      ->withCount(['permissions', 'users'])
      ->columnDefinitions([
        Column::group(['name', 'otobrazhaemoe_imya'])->searchable()->sortable(),
        Column::make('created_at')->dateRange()->sortable(),
      ])
      ->applyFilters($request->query('filters', []))
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('otobrazhaemoe_imya', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (Rol $rol) => [
        'id' => $rol->id,
        'name' => $rol->name,
        'otobrazhaemoe_imya' => $rol->otobrazhaemoe_imya ?? $rol->name,
        'opisanie' => $rol->opisanie,
        'prav_count' => $rol->permissions_count,
        'polzovateley_count' => $rol->users_count,
        'created_at' => $rol->created_at?->format('d.m.Y H:i'),
      ]);

    return Inertia::render('roli/index', [
      'roli' => $roli,
      'state' => [
        'search' => $request->string('search')->toString(),
        'col' => $request->string('col')->toString(),
        'sort' => $request->string('sort')->toString(),
      ],
    ]);
  }

  public function create(): Response
  {
    return Inertia::render('roli/create', $this->formDannye());
  }

  public function store(SohranitRolRequest $request): RedirectResponse
  {
    $rol = Rol::query()->create([
      'name' => $request->string('name')->toString(),
      'guard_name' => 'web',
      'otobrazhaemoe_imya' => $request->string('otobrazhaemoe_imya')->toString(),
      'opisanie' => $request->string('opisanie')->toString() ?: null,
    ]);

    $rol->syncPermissions($request->input('prava', []));

    return to_route('roli.index')->with('status', 'Роль создана.');
  }

  public function edit(Rol $rol): Response
  {
    $rol->load('permissions');

    return Inertia::render('roli/edit', [
      ...$this->formDannye(),
      'rol' => [
        'id' => $rol->id,
        'name' => $rol->name,
        'otobrazhaemoe_imya' => $rol->otobrazhaemoe_imya ?? $rol->name,
        'opisanie' => $rol->opisanie,
        'prava' => $rol->permissions->pluck('name')->values(),
      ],
    ]);
  }

  public function update(SohranitRolRequest $request, Rol $rol): RedirectResponse
  {
    if ($rol->name === 'administrator' && $request->string('name')->toString() !== 'administrator') {
      return back()->withErrors([
        'name' => 'Системную роль администратора переименовать нельзя.',
      ]);
    }

    $rol->update([
      'name' => $request->string('name')->toString(),
      'otobrazhaemoe_imya' => $request->string('otobrazhaemoe_imya')->toString(),
      'opisanie' => $request->string('opisanie')->toString() ?: null,
    ]);

    $rol->syncPermissions($request->input('prava', []));

    return to_route('roli.index')->with('status', 'Роль обновлена.');
  }

  public function destroy(Rol $rol): RedirectResponse
  {
    if ($rol->name === 'administrator') {
      return back()->withErrors([
        'udalenie' => 'Роль администратора удалить нельзя.',
      ]);
    }

    if ($rol->users()->exists()) {
      return back()->withErrors([
        'udalenie' => 'Нельзя удалить роль, назначенную пользователям.',
      ]);
    }

    $rol->delete();

    return to_route('roli.index')->with('status', 'Роль удалена.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formDannye(): array
  {
    return [
      'kategoriiPrav' => $this->dostupRegistrator->kategorii(),
    ];
  }
}
