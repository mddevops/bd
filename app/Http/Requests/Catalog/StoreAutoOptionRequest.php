<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class StoreAutoOptionRequest extends FormRequest
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
    $optionId = $this->route('option')?->id;

    return [
      'name' => ['required', 'string', 'max:255'],
      'parent_id' => ['nullable', 'exists:auto_options,id', 'not_in:'.$optionId],
      'sort' => ['nullable', 'integer', 'min:0'],
    ];
  }
}
