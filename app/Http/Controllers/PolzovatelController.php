<?php

namespace App\Http\Controllers;

use App\Http\Requests\Polzovatel\SohranitPolzovatelyaRequest;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class PolzovatelController extends Controller
{
  public function index(Request $request): Response
  {
    $filtry = $this->filtryPolzovateley($request);

    $polzovateli = DataTable::query(User::query())
      ->with('roles')
      ->columnDefinitions([
        Column::group(['name', 'email'])->searchable()->sortable(),
        Column::make('aktiven')->filterable()->sortable(),
        Column::make('rol')
          ->filterable()
          ->filterUsing(function (Builder $query, array $values): void {
            $ids = array_values(array_filter(array_map('intval', $values)));

            if ($ids === []) {
              return;
            }

            $query->whereHas('roles', fn (Builder $roles) => $roles->whereIn('roles.id', $ids));
          }),
        Column::make('created_at')->dateRange()->sortable(),
      ])
      ->applyFilters($filtry['expressions'])
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy('name', 'asc')
      ->perPage(15)
      ->make()
      ->through(fn (User $polzovatel) => [
        'id' => $polzovatel->id,
        'name' => $polzovatel->name,
        'email' => $polzovatel->email,
        'aktiven' => $polzovatel->aktiven,
        'roli' => $polzovatel->roles->map(fn (Rol $rol) => [
          'id' => $rol->id,
          'name' => $rol->name,
          'otobrazhaemoe_imya' => $rol->otobrazhaemoe_imya ?? $rol->name,
        ])->values(),
        'created_at' => $polzovatel->created_at?->format('d.m.Y H:i'),
      ]);

    return Inertia::render('polzovateli/index', [
      'polzovateli' => $polzovateli,
      'state' => $this->stateTablicy($request),
      'filters' => $filtry['state'],
      'dostupnyeRoli' => $this->spisokRoley(),
    ]);
  }

  public function create(): Response
  {
    return Inertia::render('polzovateli/create', $this->formDannye());
  }

  public function store(SohranitPolzovatelyaRequest $request): RedirectResponse
  {
    $polzovatel = User::query()->create([
      'name' => $request->string('name')->toString(),
      'email' => $request->string('email')->toString(),
      'password' => Hash::make($request->string('password')->toString()),
      'aktiven' => $request->boolean('aktiven'),
    ]);

    $polzovatel->syncRoles(Rol::query()->whereIn('id', $request->input('roli', []))->pluck('name'));

    return to_route('polzovateli.index')->with('status', 'Пользователь создан.');
  }

  public function edit(User $polzovatel): Response
  {
    return Inertia::render('polzovateli/edit', [
      ...$this->formDannye(),
      'polzovatel' => [
        'id' => $polzovatel->id,
        'name' => $polzovatel->name,
        'email' => $polzovatel->email,
        'aktiven' => $polzovatel->aktiven,
        'roli' => $polzovatel->roles->pluck('id')->values(),
      ],
    ]);
  }

  public function update(SohranitPolzovatelyaRequest $request, User $polzovatel): RedirectResponse
  {
    $polzovatel->fill([
      'name' => $request->string('name')->toString(),
      'email' => $request->string('email')->toString(),
      'aktiven' => $request->boolean('aktiven'),
    ]);

    if ($request->filled('password')) {
      $polzovatel->password = Hash::make($request->string('password')->toString());
    }

    $polzovatel->save();

    $polzovatel->syncRoles(Rol::query()->whereIn('id', $request->input('roli', []))->pluck('name'));

    return to_route('polzovateli.index')->with('status', 'Пользователь обновлён.');
  }

  public function destroy(Request $request, User $polzovatel): RedirectResponse
  {
    if ($request->user()?->is($polzovatel)) {
      return back()->withErrors([
        'udalenie' => 'Нельзя удалить собственный аккаунт.',
      ]);
    }

    $polzovatel->delete();

    return to_route('polzovateli.index')->with('status', 'Пользователь удалён.');
  }

  /**
   * @return array<string, mixed>
   */
  private function formDannye(): array
  {
    return [
      'dostupnyeRoli' => $this->spisokRoley(),
    ];
  }

  /**
   * @return array<int, array{id: int, name: string, otobrazhaemoe_imya: string}>
   */
  private function spisokRoley(): array
  {
    return Rol::query()
      ->orderBy('otobrazhaemoe_imya')
      ->get(['id', 'name', 'otobrazhaemoe_imya'])
      ->map(fn (Rol $rol) => [
        'id' => $rol->id,
        'name' => $rol->name,
        'otobrazhaemoe_imya' => $rol->otobrazhaemoe_imya ?? $rol->name,
      ])
      ->values()
      ->all();
  }

  /**
   * @return array{
   *   expressions: list<string>,
   *   state: array{
   *     aktiven: string|null,
   *     rol: string|null,
   *     created_at_from: string|null,
   *     created_at_to: string|null
   *   }
   * }
   */
  private function filtryPolzovateley(Request $request): array
  {
    $aktiven = $request->string('aktiven')->toString();
    $rol = $request->string('rol')->toString();
    $createdFrom = $request->string('created_at_from')->toString();
    $createdTo = $request->string('created_at_to')->toString();

    $expressions = [];

    if (in_array($aktiven, ['0', '1'], true)) {
      $expressions[] = "aktiven:{$aktiven}";
    }

    if ($rol !== '' && ctype_digit($rol)) {
      $expressions[] = "rol:{$rol}";
    }

    if ($createdFrom !== '') {
      $expressions[] = "created_at_from:{$createdFrom}";
    }

    if ($createdTo !== '') {
      $expressions[] = "created_at_to:{$createdTo}";
    }

    return [
      'expressions' => $expressions,
      'state' => [
        'aktiven' => in_array($aktiven, ['0', '1'], true) ? $aktiven : null,
        'rol' => $rol !== '' && ctype_digit($rol) ? $rol : null,
        'created_at_from' => $createdFrom !== '' ? $createdFrom : null,
        'created_at_to' => $createdTo !== '' ? $createdTo : null,
      ],
    ];
  }

  /**
   * @return array{search: string, col: string, sort: string}
   */
  private function stateTablicy(Request $request): array
  {
    return [
      'search' => $request->string('search')->toString(),
      'col' => $request->string('col')->toString(),
      'sort' => $request->string('sort')->toString(),
    ];
  }
}
