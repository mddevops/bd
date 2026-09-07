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
      'engine_volume' => ['nullable', 'string', 'max:50'],
      'vin' => ['nullable', 'string', 'max:100'],
      'body_number' => ['nullable', 'string', 'max:100'],
      'pts_type' => ['nullable', 'integer', 'in:0,1,2'],
      'price' => ['nullable', 'integer', 'min:0'],
      'transport_cost' => ['nullable', 'integer', 'min:0'],
      'sale_price' => ['required', 'integer', 'min:0'],
      'sell_out' => ['sometimes', 'boolean'],
      'supplier' => ['nullable', 'string', 'max:150'],
      'avito_price' => ['nullable', 'integer', 'min:0'],
      'key_number' => ['nullable', 'string', 'max:100'],
      'status_id' => ['nullable', 'integer', 'exists:car_statuses,id'],
      'is_sold' => ['sometimes', 'boolean'],
      'transit' => ['nullable', 'integer', 'in:0,1,2'],
      'comment' => ['nullable', 'string', 'max:5000'],
      'direct' => ['nullable', 'integer', 'min:0'],
      'service_book' => ['sometimes', 'boolean'],
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
      'power',
      'pts_type',
      'price',
      'transport_cost',
      'avito_price',
      'status_id',
      'transit',
      'direct',
    ];

    $payload = [
      'is_sold' => $this->boolean('is_sold'),
      'sell_out' => $this->boolean('sell_out'),
      'service_book' => $this->boolean('service_book'),
    ];

    foreach (['color', 'link', 'complectation', 'salon', 'supplier', 'vin', 'body_number', 'key_number', 'engine_volume', 'comment'] as $field) {
      if ($this->input($field) === '') {
        $payload[$field] = null;
      }
    }

    foreach ($nullableInts as $field) {
      if ($this->input($field) === '' || $this->input($field) === null) {
        $payload[$field] = null;
      }
    }

    $this->merge($payload);
  }
}
