<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return [
            // Infos User
            'email'      => ['required', 'email', 'max:150', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'max:255'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:30'],

            // Infos Doctor
            'speciality'   => ['required', 'string', 'max:120'],
            'service_id'   => ['required', 'exists:services,id'],
            'office_phone' => ['nullable', 'string', 'max:30'],
            'is_available' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'      => 'L’email est obligatoire.',
            'email.unique'        => 'Cet email est déjà utilisé.',
            'password.required'   => 'Le mot de passe est obligatoire.',
            'password.min'        => 'Le mot de passe doit contenir au moins 8 caractères.',
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'speciality.required' => 'La spécialité est obligatoire.',
            'service_id.required' => 'Le service est obligatoire.',
            'service_id.exists'   => 'Le service sélectionné n’existe pas.',
        ];
    }
}