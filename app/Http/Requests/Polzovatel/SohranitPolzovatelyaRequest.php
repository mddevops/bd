<?php

namespace App\Http\Requests\Polzovatel;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class SohranitPolzovatelyaRequest extends FormRequest
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
    /** @var User|null $polzovatel */
    $polzovatel = $this->route('polzovatel');

    return [
      'name' => ['required', 'string', 'max:255'],
      'email' => [
        'required',
        'string',
        'email',
        'max:255',
        Rule::unique('users', 'email')->ignore($polzovatel?->id),
      ],
      'password' => [
        $polzovatel ? 'nullable' : 'required',
        'confirmed',
        Password::defaults(),
      ],
      'aktiven' => ['required', 'boolean'],
      'roli' => ['nullable', 'array'],
      'roli.*' => ['integer', 'exists:roles,id'],
    ];
  }

  /**
   * @return array<string, string>
   */
  public function attributes(): array
  {
    return [
      'name' => 'имя',
      'email' => 'email',
      'password' => 'пароль',
      'aktiven' => 'активность',
      'roli' => 'роли',
    ];
  }
}
