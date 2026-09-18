<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $allowedStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
                $newStatus = $this->input('status');

                if (! in_array($newStatus, $allowedStatuses, true)) {
                    $validator->errors()->add('status', 'Statut invalide.');
                    return;
                }

                /** @var Appointment $appointment */
                $appointment = $this->route('appointment');
                $current = $appointment->status;

                $allowed = [
                    'pending'   => ['confirmed', 'cancelled'],
                    'confirmed' => ['completed', 'cancelled', 'no_show'],
                    'completed' => [],
                    'cancelled' => [],
                    'no_show'   => [],
                ];

                if (! in_array($newStatus, $allowed[$current] ?? [], true)) {
                    $validator->errors()->add(
                        'status',
                        "Transition invalide : {$current} → {$newStatus}."
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Le statut est obligatoire.',
        ];
    }
}