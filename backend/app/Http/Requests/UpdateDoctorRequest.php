<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        $doctor = $this->route('doctor');
        $userId = $doctor?->user_id;

        return [
            // Infos User (optionnelles à la modification)
            'email' => [
                'sometimes', 'email', 'max:150',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name'  => ['sometimes', 'string', 'max:100'],
            'phone'      => ['sometimes', 'nullable', 'string', 'max:30'],
            'is_active'  => ['sometimes', 'boolean'],

            // Infos Doctor
            'speciality'   => ['sometimes', 'string', 'max:120'],
            'service_id'   => ['sometimes', 'exists:services,id'],
            'office_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'is_available' => ['sometimes', 'boolean'],
        ];
    }
}