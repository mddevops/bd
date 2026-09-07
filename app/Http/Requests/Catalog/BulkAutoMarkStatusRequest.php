<?php

namespace App\Http\Requests\Catalog;

class BulkAutoMarkStatusRequest extends BulkAutoMarkRequest
{
  /**
   * @return array<string, mixed>
   */
  public function rules(): array
  {
    return [
      ...parent::rules(),
      'status' => ['required', 'boolean'],
    ];
  }
}
