<?php

namespace App\Http\Requests\Catalog;

use App\Support\CatalogImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAutoMarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge([
                'url' => Str::slug($this->string('name')->toString()),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mark = $this->route('mark');

        return [
            'name' => ['required', 'string', 'max:255'],
            'name_ru' => ['nullable', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:255', Rule::unique('auto_marks', 'url')->ignore($mark)],
            'logo_min' => CatalogImage::uploadRules(),
            'logo_big' => CatalogImage::uploadRules(),
            'country' => ['nullable', 'string', 'max:255'],
            'status' => ['boolean'],
            'ordering' => ['nullable', 'integer', 'min:1', 'max:999999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Укажите название.',
            'url.required' => 'URL не может быть пустым — проверьте название (EN).',
            'url.unique' => 'Марка с таким URL уже существует.',
        ];
    }
}
