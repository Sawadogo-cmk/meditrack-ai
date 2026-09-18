<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'record_type'     => $this->record_type,
            'title'           => $this->title,
            'description'     => $this->description,
            'record_date'     => $this->record_date?->toIso8601String(),
            'consultation_id' => $this->consultation_id,
            'created_by'      => $this->created_by,
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}