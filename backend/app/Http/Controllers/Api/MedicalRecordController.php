<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MedicalRecordResource;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MedicalRecordController extends Controller
{
    public function indexByPatient(Request $request, Patient $patient): AnonymousResourceCollection
    {
        $query = $patient->medicalRecords()->orderByDesc('record_date');

        if ($type = $request->input('type')) {
            $query->where('record_type', $type);
        }

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);

        return MedicalRecordResource::collection($query->paginate($perPage));
    }
}