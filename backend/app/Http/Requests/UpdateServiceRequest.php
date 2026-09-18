<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'name' => [
                'sometimes', 'string', 'max:100',
                Rule::unique('services', 'name')->ignore($serviceId),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active'   => ['sometimes', 'boolean'],
        ];
    }
}