<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class BulkAutoMarkRequest extends FormRequest
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
      'ids' => ['required', 'array', 'min:1'],
      'ids.*' => ['integer', 'distinct', 'exists:auto_marks,id'],
    ];
  }

  /**
   * @return list<int>
   */
  public function ids(): array
  {
    return array_values(array_map('intval', $this->input('ids', [])));
  }
}
