<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role?->name, ['admin', 'doctor']);
    }

    public function rules(): array
    {
        return [
            'patient_id'        => ['required', 'exists:patients,id'],
            'doctor_id'         => ['required', 'exists:doctors,id'],
            'appointment_id'    => [
                'nullable',
                'exists:appointments,id',
                Rule::unique('consultations', 'appointment_id'),
            ],
            'consultation_date' => ['nullable', 'date'],
            'motif'             => ['nullable', 'string', 'max:255'],
            'observations'      => ['nullable', 'string'],
            'diagnostic'        => ['nullable', 'string'],
            'traitement'        => ['nullable', 'string'],
            'notes'             => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'     => 'Le patient est obligatoire.',
            'patient_id.exists'       => 'Ce patient n’existe pas.',
            'doctor_id.required'      => 'Le médecin est obligatoire.',
            'doctor_id.exists'        => 'Ce médecin n’existe pas.',
            'appointment_id.exists'   => 'Ce rendez-vous n’existe pas.',
            'appointment_id.unique'   => 'Une consultation existe déjà pour ce rendez-vous.',
        ];
    }
}