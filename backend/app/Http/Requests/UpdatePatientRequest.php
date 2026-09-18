<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'first_name'              => ['sometimes', 'string', 'max:100'],
            'last_name'               => ['sometimes', 'string', 'max:100'],
            'birth_date'              => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender'                  => ['sometimes', 'nullable', 'in:M,F,autre'],
            'phone'                   => ['sometimes', 'nullable', 'string', 'max:30'],
            'address'                 => ['sometimes', 'nullable', 'string'],
            'blood_group'             => ['sometimes', 'nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'emergency_contact_name'  => ['sometimes', 'nullable', 'string', 'max:150'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
        ];
    }
}