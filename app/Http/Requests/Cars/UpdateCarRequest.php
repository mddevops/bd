<?php

namespace App\Http\Requests\Cars;

class UpdateCarRequest extends StoreCarRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('cars.update') ?? false;
  }
}
