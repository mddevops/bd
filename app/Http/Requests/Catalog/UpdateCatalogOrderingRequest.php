<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCatalogOrderingRequest extends FormRequest
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
      'ordering' => ['nullable', 'integer', 'min:1'],
    ];
  }

  protected function prepareForValidation(): void
  {
    if ($this->input('ordering') === '' || $this->input('ordering') === '0') {
      $this->merge(['ordering' => null]);
    }
  }
}
