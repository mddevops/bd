<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAutoModelRequest extends FormRequest
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
    $modelId = $this->route('model')?->id;
    $markId = $this->integer('mark_id');

    return [
      'mark_id' => ['required', 'exists:auto_marks,id'],
      'name' => ['required', 'string', 'max:255'],
      'name_ru' => ['nullable', 'string', 'max:255'],
      'url' => [
        'required',
        'string',
        'max:255',
        Rule::unique('auto_models', 'url')->where('mark_id', $markId)->ignore($modelId),
      ],
      'class' => ['nullable', 'string', 'max:50'],
      'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
      'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100', 'gte:year_from'],
      'parent_id' => ['nullable', 'exists:auto_models,id'],
      'status' => ['boolean'],
      'ordering' => ['nullable', 'integer', 'min:1', 'max:999999'],
    ];
  }
}
