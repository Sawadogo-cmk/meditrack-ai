<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role?->name, ['admin', 'doctor']);
    }

    public function rules(): array
    {
        return [
            'consultation_date' => ['sometimes', 'date'],
            'motif'             => ['sometimes', 'nullable', 'string', 'max:255'],
            'observations'      => ['sometimes', 'nullable', 'string'],
            'diagnostic'        => ['sometimes', 'nullable', 'string'],
            'traitement'        => ['sometimes', 'nullable', 'string'],
            'notes'             => ['sometimes', 'nullable', 'string'],
        ];
    }
}