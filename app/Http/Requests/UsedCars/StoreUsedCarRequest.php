<?php

namespace App\Http\Requests\UsedCars;

use App\Enums\UsedCarServiceStatus;
use App\Enums\UsedCarServiceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUsedCarRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('used_cars.create') ?? false;
  }

  /**
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'showroom_id' => ['nullable', 'integer', 'exists:showrooms,id'],
      'arrival_date' => ['nullable', 'date'],
      'mark_id' => ['required', 'integer', 'exists:auto_marks,id'],
      'model_id' => ['required', 'integer', 'exists:auto_models,id'],
      'year' => ['required', 'integer', 'min:1950', 'max:'.(date('Y') + 1)],
      'body_type_id' => ['nullable', 'integer', 'exists:body_types,id'],
      'transmission_id' => ['nullable', 'integer', 'exists:transmissions,id'],
      'engine_type_id' => ['nullable', 'integer', 'exists:engine_types,id'],
      'wheel_type_id' => ['nullable', 'integer', 'exists:wheel_types,id'],
      'color' => ['nullable', 'string', 'max:150'],
      'interior_type_id' => ['nullable', 'integer', 'exists:interior_types,id'],
      'owner_count' => ['nullable', 'integer', 'min:1', 'max:20'],
      'power' => ['nullable', 'integer', 'min:0', 'max:2000'],
      'mileage' => ['required', 'integer', 'min:0'],
      'engine_volume' => ['nullable', 'string', 'max:50'],
      'vin' => ['nullable', 'string', 'max:100'],
      'license_plate' => ['nullable', 'string', 'max:100'],
      'sts_number' => ['nullable', 'string', 'max:100'],
      'pts_type' => ['nullable', 'integer', 'in:1,2,3'],
      'is_registered' => ['sometimes', 'boolean'],
      'key_number' => ['nullable', 'string', 'max:100'],
      'legal_entity' => ['nullable', 'string', 'max:150'],
      'service_book' => ['sometimes', 'boolean'],
      'is_trade_in' => ['sometimes', 'boolean'],
      'status_id' => ['nullable', 'integer', 'exists:used_car_statuses,id'],
      'purchase_price' => ['nullable', 'integer', 'min:0'],
      'sale_price' => ['required', 'integer', 'min:0'],
      'avito_price' => ['nullable', 'integer', 'min:0'],
      'repair_cost' => ['nullable', 'integer', 'min:0'],
      'transport_cost' => ['nullable', 'integer', 'min:0'],
      'deregistration_cost' => ['nullable', 'integer', 'min:0'],
      'avito_url' => ['nullable', 'string', 'max:500'],
      'autoteka_url' => ['nullable', 'string', 'max:350'],
      'sale_type' => ['nullable', 'string', 'max:120'],
      'comment' => ['nullable', 'string', 'max:5000'],
      'services' => ['nullable', 'array'],
      'services.*.type' => ['required', 'string', Rule::enum(UsedCarServiceType::class)],
      'services.*.status' => ['nullable', 'integer', Rule::enum(UsedCarServiceStatus::class)],
      'services.*.cost' => ['nullable', 'integer', 'min:0'],
      'services.*.comment' => ['nullable', 'string', 'max:300'],
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
      'owner_count',
      'power',
      'pts_type',
      'status_id',
      'purchase_price',
      'avito_price',
      'repair_cost',
      'transport_cost',
      'deregistration_cost',
    ];

    $payload = [
      'is_trade_in' => $this->boolean('is_trade_in'),
      'is_registered' => $this->boolean('is_registered'),
      'service_book' => $this->boolean('service_book'),
    ];

    if ($this->input('color') === '') {
      $payload['color'] = null;
    }

    foreach ($nullableInts as $field) {
      if ($this->input($field) === '' || $this->input($field) === null) {
        $payload[$field] = null;
      }
    }

    $this->merge($payload);
  }
}
