<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'first_name'              => ['required', 'string', 'max:100'],
            'last_name'               => ['required', 'string', 'max:100'],
            'birth_date'              => ['nullable', 'date', 'before:today'],
            'gender'                  => ['nullable', 'in:M,F,autre'],
            'phone'                   => ['nullable', 'string', 'max:30'],
            'address'                 => ['nullable', 'string'],
            'blood_group'             => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'emergency_contact_name'  => ['nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'birth_date.before'   => 'La date de naissance doit être dans le passé.',
            'gender.in'           => 'Le genre doit être M, F ou autre.',
            'blood_group.in'      => 'Groupe sanguin invalide.',
        ];
    }
}