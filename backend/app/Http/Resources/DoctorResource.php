<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'speciality'   => $this->speciality,
            'office_phone' => $this->office_phone,
            'is_available' => (bool) $this->is_available,
            'user'         => $this->whenLoaded('user', fn () => [
                'id'         => $this->user->id,
                'email'      => $this->user->email,
                'first_name' => $this->user->first_name,
                'last_name'  => $this->user->last_name,
                'full_name'  => "{$this->user->first_name} {$this->user->last_name}",
                'phone'      => $this->user->phone,
                'is_active'  => (bool) $this->user->is_active,
            ]),
            'service'      => $this->whenLoaded('service', fn () => [
                'id'   => $this->service->id,
                'name' => $this->service->name,
            ]),
            'created_at'   => $this->created_at?->toIso8601String(),
            'updated_at'   => $this->updated_at?->toIso8601String(),
        ];
    }
}