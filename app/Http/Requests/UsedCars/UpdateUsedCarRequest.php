<?php

namespace App\Http\Requests\UsedCars;

class UpdateUsedCarRequest extends StoreUsedCarRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('used_cars.update') ?? false;
  }
}
