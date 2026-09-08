<?php

namespace App\Http\Requests\Cars;

use Illuminate\Foundation\Http\FormRequest;

class StoreCarRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('cars.create') ?? false;
  }

  /**
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'showroom_id' => ['nullable', 'integer', 'exists:showrooms,id'],
      'link' => ['nullable', 'string', 'max:255'],
      'avito_url' => ['nullable', 'string', 'max:500'],
      'autoteka_url' => ['nullable', 'string', 'max:350'],
      'arrival_date' => ['nullable', 'date'],
      'mark_id' => ['required', 'integer', 'exists:auto_marks,id'],
      'model_id' => ['required', 'integer', 'exists:auto_models,id'],
      'year' => ['required', 'integer', 'min:1950', 'max:'.(date('Y') + 2)],
      'complectation' => ['nullable', 'string', 'max:100'],
      'body_type_id' => ['nullable', 'integer', 'exists:body_types,id'],
      'transmission_id' => ['nullable', 'integer', 'exists:transmissions,id'],
      'engine_type_id' => ['nullable', 'integer', 'exists:engine_types,id'],
      'wheel_type_id' => ['nullable', 'integer', 'exists:wheel_types,id'],
      'power' => ['nullable', 'integer', 'min:0', 'max:2000'],
      'salon' => ['nullable', 'string', 'max:100'],
      'color' => ['nullable', 'string', 'max:100'],
      'interior_type_id' => ['nullable', 'integer', 'exists:interior_types,id'],
      'engine_volume' => ['nullable', 'string', 'max:50'],
      'vin' => ['nullable', 'string', 'max:100'],
      'body_number' => ['nullable', 'string', 'max:100'],
      'pts_type' => ['nullable', 'integer', 'in:0,1,2'],
      'price' => ['nullable', 'integer', 'min:0'],
      'transport_cost' => ['nullable', 'integer', 'min:0'],
      'repair_cost' => ['nullable', 'integer', 'min:0'],
      'deregistration_cost' => ['nullable', 'integer', 'min:0'],
      'sale_price' => ['required', 'integer', 'min:0'],
      'sell_out' => ['sometimes', 'boolean'],
      'supplier' => ['nullable', 'string', 'max:150'],
      'avito_price' => ['nullable', 'integer', 'min:0'],
      'key_number' => ['nullable', 'string', 'max:100'],
      'status_id' => ['nullable', 'integer', 'exists:car_statuses,id'],
      'transit' => ['sometimes', 'integer', 'in:0,1,2'],
      'comment' => ['nullable', 'string', 'max:5000'],
      'direct' => ['nullable', 'integer', 'min:0'],
    ];
  }

  protected function prepareForValidation(): void
  {
    $nullableInts = [
      'showroom_id',
      'body_type_id',
      'transmission_id',
      'engine_type_id',
      'wheel_type_id',
      'interior_type_id',
      'power',
      'pts_type',
      'price',
      'transport_cost',
      'repair_cost',
      'deregistration_cost',
      'avito_price',
      'status_id',
      'direct',
    ];

    $payload = [
      'sell_out' => $this->boolean('sell_out'),
      // В БД transit NOT NULL с default 0 — пустое значение нельзя писать как null.
      'transit' => $this->filled('transit') ? (int) $this->input('transit') : 0,
    ];

    foreach ([
      'color',
      'link',
      'avito_url',
      'autoteka_url',
      'complectation',
      'salon',
      'supplier',
      'vin',
      'body_number',
      'key_number',
      'engine_volume',
      'comment',
    ] as $field) {
      if ($this->input($field) === '') {
        $payload[$field] = null;
      }
    }

    foreach ($nullableInts as $field) {
      if ($this->input($field) === '' || $this->input($field) === null) {
        $payload[$field] = null;
      }
    }

    // Старое поле link синхронизируем с Авито, если явно не передали link.
    if (array_key_exists('avito_url', $payload) || $this->has('avito_url')) {
      $avito = $payload['avito_url'] ?? $this->input('avito_url');
      if (! $this->has('link')) {
        $payload['link'] = $avito;
      }
    }

    $this->merge($payload);
  }
}
