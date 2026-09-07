<?php

namespace App\Http\Requests\Catalog;

use App\Support\CatalogImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAutoSerieRequest extends FormRequest
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
        $serieId = $this->route('series')?->id;
        $generationId = $this->integer('generation_id');

        return [
            'model_id' => ['required', 'exists:auto_models,id'],
            'generation_id' => ['required', 'exists:auto_generations,id'],
            'name' => ['required', 'string', 'max:255'],
            'url' => [
                'required',
                'string',
                'max:255',
                Rule::unique('auto_series', 'url')->where('generation_id', $generationId)->ignore($serieId),
            ],
            'image' => CatalogImage::uploadRules(),
            'status' => ['boolean'],
        ];
    }
}
