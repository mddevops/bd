<?php

namespace App\Http\Requests\Rol;

use App\Models\Rol;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SohranitRolRequest extends FormRequest
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
    /** @var Rol|null $rol */
    $rol = $this->route('rol');

    return [
      'name' => [
        'required',
        'string',
        'max:255',
        'alpha_dash',
        Rule::unique('roles', 'name')->ignore($rol?->id),
      ],
      'otobrazhaemoe_imya' => ['required', 'string', 'max:255'],
      'opisanie' => ['nullable', 'string', 'max:1000'],
      'prava' => ['nullable', 'array'],
      'prava.*' => ['string', Rule::in(app(\App\Services\DostupRegistrator::class)->vsePrava())],
    ];
  }

  /**
   * @return array<string, string>
   */
  public function attributes(): array
  {
    return [
      'name' => 'системное имя',
      'otobrazhaemoe_imya' => 'название',
      'opisanie' => 'описание',
      'prava' => 'права доступа',
    ];
  }
}
