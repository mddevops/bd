<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Catalog\Concerns\ReordersCatalogItems;
use App\Http\Requests\Catalog\ReorderCatalogRequest;
use App\Services\DictionaryRegistry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Raprmdn\DataTables\Column;
use Raprmdn\DataTables\Facades\DataTable;

class DictionaryController extends Controller
{
  use ReordersCatalogItems;

  public function index(Request $request, string $type): Response
  {
    $dictionary = DictionaryRegistry::get($type);
    /** @var class-string<Model> $modelClass */
    $modelClass = $dictionary['model'];
    $primaryKey = $dictionary['primary_key'];
    $nameColumn = $dictionary['name_column'];
    $sortable = (bool) $dictionary['sortable'];

    $query = $modelClass::query();

    if ($sortable) {
      $query
        ->orderByRaw('(CASE WHEN ordering IS NULL OR ordering = 0 THEN 1 ELSE 0 END) ASC')
        ->orderBy('ordering')
        ->orderBy($primaryKey);
    }

    $columnDefinitions = [
      Column::make($nameColumn)->searchable()->sortable(),
    ];

    if ($sortable) {
      $columnDefinitions[] = Column::make('ordering')->sortable();
    }

    foreach (array_keys($dictionary['fields']) as $field) {
      if ($field === $nameColumn) {
        continue;
      }

      $columnDefinitions[] = Column::make($field)->sortable();
    }

    [$defaultSortColumn, $defaultSortDirection] = $dictionary['default_sort'];

    $rows = DataTable::query($query)
      ->columnDefinitions($columnDefinitions)
      ->applySort($request->string('col')->toString() ?: null)
      ->orderBy($defaultSortColumn, $defaultSortDirection)
      ->perPage(20)
      ->make()
      ->through(function (Model $row) use ($dictionary, $primaryKey, $sortable) {
        $payload = [
          'id' => $row->getAttribute($primaryKey),
        ];

        if ($sortable) {
          $ordering = $row->getAttribute('ordering');
          $payload['ordering'] = ($ordering && (int) $ordering > 0) ? (int) $ordering : null;
        }

        foreach (array_keys($dictionary['fields']) as $field) {
          $payload[$field] = $row->getAttribute($field);
        }

        return $payload;
      });

    return Inertia::render('dictionaries/index', [
      'dictionary' => [
        'type' => $type,
        'label' => $dictionary['label'],
        'primary_key' => $primaryKey,
        'sortable' => $sortable,
        'fields' => $dictionary['fields'],
      ],
      'menu' => DictionaryRegistry::menu(),
      'rows' => $rows,
      'state' => [
        'search' => $request->string('search')->toString() ?: null,
        'col' => $request->string('col')->toString() ?: null,
        'sort' => $request->string('sort')->toString() ?: null,
        'page' => max(1, (int) $request->input('page', 1)),
        'limit' => max(1, (int) $request->input('limit', 20)),
      ],
    ]);
  }

  public function store(Request $request, string $type): RedirectResponse
  {
    $dictionary = DictionaryRegistry::get($type);
    /** @var class-string<Model> $modelClass */
    $modelClass = $dictionary['model'];

    $this->normalizeColorInputs($request, $dictionary);
    $validated = $request->validate($this->rules($dictionary));

    if ($dictionary['sortable']) {
      $max = (int) $modelClass::query()->max('ordering');
      $validated['ordering'] = $max > 0 ? $max + 1 : 1;
    }

    $modelClass::query()->create($validated);

    return back()->with('status', 'Запись добавлена');
  }

  public function update(Request $request, string $type, string $id): RedirectResponse
  {
    $dictionary = DictionaryRegistry::get($type);
    /** @var class-string<Model> $modelClass */
    $modelClass = $dictionary['model'];
    $primaryKey = $dictionary['primary_key'];

    $row = $modelClass::query()->where($primaryKey, $id)->firstOrFail();
    $this->normalizeColorInputs($request, $dictionary);
    $validated = $request->validate($this->rules($dictionary, $id));

    $row->fill($validated)->save();

    return back()->with('status', 'Запись обновлена');
  }

  public function destroy(string $type, string $id): RedirectResponse
  {
    $dictionary = DictionaryRegistry::get($type);
    /** @var class-string<Model> $modelClass */
    $modelClass = $dictionary['model'];
    $primaryKey = $dictionary['primary_key'];

    $modelClass::query()->where($primaryKey, $id)->delete();

    return back()->with('status', 'Запись удалена');
  }

  public function reorder(ReorderCatalogRequest $request, string $type): RedirectResponse
  {
    $dictionary = DictionaryRegistry::get($type);

    if (! $dictionary['sortable']) {
      abort(404);
    }

    /** @var class-string<Model> $modelClass */
    $modelClass = $dictionary['model'];

    $this->reorderByIds($modelClass, $request->validated('ids'));

    return back()->with('status', 'Порядок обновлён');
  }

  /**
   * @param  array<string, mixed>  $dictionary
   * @return array<string, mixed>
   */
  private function rules(array $dictionary, ?string $id = null): array
  {
    $rules = [];
    $primaryKey = $dictionary['primary_key'];

    foreach ($dictionary['fields'] as $field => $meta) {
      $fieldRules = [];

      if ($meta['required'] ?? false) {
        $fieldRules[] = 'required';
      } else {
        $fieldRules[] = 'nullable';
      }

      $fieldRules[] = match ($meta['type'] ?? 'text') {
        'number' => 'integer',
        'boolean' => 'boolean',
        'color' => 'regex:/^#[0-9A-Fa-f]{6}$/',
        default => 'string',
      };

      if (($meta['type'] ?? 'text') === 'text') {
        $fieldRules[] = 'max:255';
      }

      if (($meta['type'] ?? 'text') === 'color') {
        // size:7 только для заполненного hex; пустые уже приведены к null
        $fieldRules[] = 'regex:/^#[0-9A-Fa-f]{6}$/';
      }

      if ($field === 'slug') {
        $unique = Rule::unique($dictionary['table'], 'slug');
        if ($id !== null) {
          $unique = $unique->ignore($id, $primaryKey);
        }
        $fieldRules[] = $unique;
      }

      if ($field === 'code' && $dictionary['type'] === 'countries') {
        $unique = Rule::unique('countries', 'code');
        if ($id !== null) {
          $unique = $unique->ignore($id, 'code');
        }
        $fieldRules[] = $unique;
      }

      $rules[$field] = $fieldRules;
    }

    return $rules;
  }

  /**
   * @param  array<string, mixed>  $dictionary
   */
  private function normalizeColorInputs(Request $request, array $dictionary): void
  {
    $payload = [];

    foreach ($dictionary['fields'] as $field => $meta) {
      if (($meta['type'] ?? '') !== 'color') {
        continue;
      }

      $value = $request->input($field);
      if ($value === null || $value === '') {
        $payload[$field] = null;
        continue;
      }

      $payload[$field] = strtoupper((string) $value);
    }

    if ($payload !== []) {
      $request->merge($payload);
    }
  }
}
