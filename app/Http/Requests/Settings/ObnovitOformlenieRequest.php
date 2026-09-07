<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ObnovitOformlenieRequest extends FormRequest
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
      'tema' => ['sometimes', Rule::in(['light', 'dark', 'system'])],
      'menyu' => ['sometimes', Rule::in(['sidebar', 'top'])],
    ];
  }
}
