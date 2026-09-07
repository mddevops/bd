<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutoEquipmentRequest extends FormRequest
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
      'modification_id' => ['required', 'exists:auto_modifications,id'],
      'name' => ['required', 'string', 'max:255'],
      'status' => ['boolean'],
    ];
  }
}
