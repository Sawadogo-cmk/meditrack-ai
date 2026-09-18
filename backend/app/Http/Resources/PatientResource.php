<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'code'                    => $this->code,
            'first_name'              => $this->first_name,
            'last_name'               => $this->last_name,
            'full_name'               => $this->full_name,
            'birth_date'              => $this->birth_date?->format('Y-m-d'),
            'age'                     => $this->birth_date?->age,
            'gender'                  => $this->gender,
            'phone'                   => $this->phone,
            'address'                 => $this->address,
            'blood_group'             => $this->blood_group,
            'emergency_contact_name'  => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'is_archived'             => $this->is_archived,
            'archived_at'             => $this->archived_at?->toIso8601String(),
            'created_by'              => $this->created_by,
            'creator'                 => $this->whenLoaded('creator', fn () => [
                'id'         => $this->creator->id,
                'first_name' => $this->creator->first_name,
                'last_name'  => $this->creator->last_name,
            ]),
            'created_at'              => $this->created_at?->toIso8601String(),
            'updated_at'              => $this->updated_at?->toIso8601String(),
        ];
    }
}