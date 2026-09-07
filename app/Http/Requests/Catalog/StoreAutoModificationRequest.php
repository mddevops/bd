<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutoModificationRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  /**
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      'series_id' => ['required', 'exists:auto_series,id'],
      'name' => ['required', 'string', 'max:255'],
      'engine_volume' => ['nullable', 'numeric', 'min:0', 'max:20'],
      'engine_power' => ['nullable', 'integer', 'min:0', 'max:2000'],
      'engine' => ['nullable', 'string', 'max:100'],
      'transmission' => ['nullable', 'string', 'max:100'],
      'drive' => ['nullable', 'string', 'max:100'],
      'consumption_100_km' => ['nullable', 'numeric', 'min:0', 'max:100'],
      'acceleration_0_100' => ['nullable', 'numeric', 'min:0', 'max:100'],
      'status' => ['boolean'],
    ];
  }
}
