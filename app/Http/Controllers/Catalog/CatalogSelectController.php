<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Services\Catalog\CatalogSelectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CatalogSelectController extends Controller
{
  public function __construct(
    private CatalogSelectService $selects,
  ) {}

  public function __invoke(Request $request, string $type): JsonResponse
  {
    $validated = $request->validate([
      'q' => ['nullable', 'string', 'max:255'],
      'id' => ['nullable', 'integer'],
      'name' => ['nullable', 'string', 'max:255'],
      'mark_id' => ['nullable', 'integer'],
      'model_id' => ['nullable', 'integer'],
      'generation_id' => ['nullable', 'integer'],
      'series_id' => ['nullable', 'integer'],
      'parent_id' => ['nullable', 'integer'],
      'exclude_id' => ['nullable', 'integer'],
      'status' => ['nullable'],
      'limit' => ['nullable', 'integer', 'min:1', 'max:'.CatalogSelectService::LIMIT],
    ]);

    $filters = collect($validated)
      ->only(['id', 'name', 'mark_id', 'model_id', 'generation_id', 'series_id', 'parent_id', 'exclude_id', 'status'])
      ->filter(fn ($value) => $value !== null && $value !== '')
      ->all();

    try {
      if (! empty($validated['id']) && empty($validated['q'])) {
        $option = $this->selects->find($type, (int) $validated['id']);

        return response()->json([
          'data' => $option ? [$option] : [],
        ]);
      }

      $options = $this->selects->search(
        $type,
        $validated['q'] ?? null,
        $filters,
        (int) ($validated['limit'] ?? CatalogSelectService::LIMIT),
      );

      return response()->json([
        'data' => $options,
      ]);
    } catch (InvalidArgumentException $exception) {
      return response()->json([
        'message' => $exception->getMessage(),
      ], 422);
    }
  }
}
