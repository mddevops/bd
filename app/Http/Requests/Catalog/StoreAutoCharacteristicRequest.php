<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutoCharacteristicRequest extends FormRequest
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
    $characteristicId = $this->route('characteristic')?->id;

    return [
      'name' => ['required', 'string', 'max:255'],
      'parent_id' => ['nullable', 'exists:auto_characteristics,id', 'not_in:'.$characteristicId],
      'sort' => ['nullable', 'integer', 'min:0'],
    ];
  }
}
