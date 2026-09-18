<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'consultation_date' => $this->consultation_date?->toIso8601String(),
            'motif'             => $this->motif,
            'observations'      => $this->observations,
            'diagnostic'        => $this->diagnostic,
            'traitement'        => $this->traitement,
            'notes'             => $this->notes,

            'appointment' => $this->whenLoaded('appointment', fn () => $this->appointment ? [
                'id'           => $this->appointment->id,
                'scheduled_at' => $this->appointment->scheduled_at?->toIso8601String(),
                'status'       => $this->appointment->status,
            ] : null),

            'patient' => $this->whenLoaded('patient', fn () => [
                'id'        => $this->patient->id,
                'code'      => $this->patient->code,
                'full_name' => $this->patient->full_name,
            ]),

            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id'         => $this->doctor->id,
                'speciality' => $this->doctor->speciality,
                'full_name'  => $this->doctor->user
                    ? "{$this->doctor->user->first_name} {$this->doctor->user->last_name}"
                    : null,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}