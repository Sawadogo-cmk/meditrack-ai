<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role?->name, ['admin', 'secretary']);
    }

    public function rules(): array
    {
        return [
            'patient_id'       => ['sometimes', 'exists:patients,id'],
            'doctor_id'        => ['sometimes', 'exists:doctors,id'],
            'service_id'       => ['sometimes', 'nullable', 'exists:services,id'],
            'scheduled_at'     => ['sometimes', 'date', 'after:now'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:240'],
            'reason'           => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes'            => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                /** @var Appointment $appointment */
                $appointment = $this->route('appointment');

                if (in_array($appointment->status, ['cancelled', 'completed', 'no_show'])) {
                    $validator->errors()->add(
                        'status',
                        'Ce rendez-vous ne peut plus être modifié (statut : ' . $appointment->status . ').'
                    );
                    return;
                }

                $start = Carbon::parse($this->input('scheduled_at', $appointment->scheduled_at));
                $duration = (int) $this->input('duration_minutes', $appointment->duration_minutes);
                $end = $start->copy()->addMinutes($duration);

                $doctorId = $this->input('doctor_id', $appointment->doctor_id);
                $patientId = $this->input('patient_id', $appointment->patient_id);

                if ($this->hasOverlap('doctor_id', $doctorId, $start, $end, $appointment->id)) {
                    $validator->errors()->add('scheduled_at', 'Ce médecin a déjà un rendez-vous sur ce créneau.');
                }

                if ($this->hasOverlap('patient_id', $patientId, $start, $end, $appointment->id)) {
                    $validator->errors()->add('scheduled_at', 'Ce patient a déjà un rendez-vous sur ce créneau.');
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
}