<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutoGenerationRequest extends FormRequest
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
      'model_id' => ['required', 'exists:auto_models,id'],
      'name' => ['required', 'string', 'max:255'],
      'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
      'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100', 'gte:year_from'],
    ];
  }
}
