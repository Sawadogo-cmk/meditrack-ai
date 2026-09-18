<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Admin, secretary, patient : peuvent créer
        $user = $this->user();
        return $user && in_array($user->role?->name, ['admin', 'secretary', 'patient']);
    }

    public function rules(): array
    {
        return [
            'patient_id'       => ['required', 'exists:patients,id'],
            'doctor_id'        => ['required', 'exists:doctors,id'],
            'service_id'       => ['nullable', 'exists:services,id'],
            'scheduled_at'     => ['required', 'date', 'after:now'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:240'],
            'reason'           => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $start = Carbon::parse($this->input('scheduled_at'));
                $duration = (int) $this->input('duration_minutes', 30);
                $end = $start->copy()->addMinutes($duration);

                // Chevauchement médecin
                if ($this->hasOverlap('doctor_id', $this->input('doctor_id'), $start, $end)) {
                    $validator->errors()->add(
                        'scheduled_at',
                        'Ce médecin a déjà un rendez-vous sur ce créneau.'
                    );
                }

                // Chevauchement patient
                if ($this->hasOverlap('patient_id', $this->input('patient_id'), $start, $end)) {
                    $validator->errors()->add(
                        'scheduled_at',
                        'Ce patient a déjà un rendez-vous sur ce créneau.'
                    );
                }
            },
        ];
    }

    private function hasOverlap(string $column, $value, Carbon $start, Carbon $end, ?int $ignoreId = null): bool
    {
        return Appointment::query()
            ->where($column, $value)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($q) use ($start, $end) {
                $q->where('scheduled_at', '<', $end)
                  ->whereRaw(
                      'DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?',
                      [$start->toDateTimeString()]
                  );
            })
            ->exists();
    }

    public function messages(): array
    {
        return [
            'patient_id.required'   => 'Le patient est obligatoire.',
            'patient_id.exists'     => 'Ce patient n’existe pas.',
            'doctor_id.required'    => 'Le médecin est obligatoire.',
            'doctor_id.exists'      => 'Ce médecin n’existe pas.',
            'scheduled_at.required' => 'La date et l’heure sont obligatoires.',
            'scheduled_at.after'    => 'Le rendez-vous doit être dans le futur.',
        ];
    }
}