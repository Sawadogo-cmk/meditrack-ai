<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'scheduled_at'     => $this->scheduled_at?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'ends_at'          => $this->scheduled_at?->copy()->addMinutes($this->duration_minutes)->toIso8601String(),
            'status'           => $this->status,
            'reason'           => $this->reason,
            'notes'            => $this->notes,

            'patient' => $this->whenLoaded('patient', fn () => [
                'id'        => $this->patient->id,
                'code'      => $this->patient->code,
                'full_name' => $this->patient->full_name,
                'phone'     => $this->patient->phone,
            ]),

            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id'         => $this->doctor->id,
                'speciality' => $this->doctor->speciality,
                'full_name'  => $this->doctor->user
                    ? "{$this->doctor->user->first_name} {$this->doctor->user->last_name}"
                    : null,
            ]),

            'service' => $this->whenLoaded('service', fn () => $this->service ? [
                'id'   => $this->service->id,
                'name' => $this->service->name,
            ] : null),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}