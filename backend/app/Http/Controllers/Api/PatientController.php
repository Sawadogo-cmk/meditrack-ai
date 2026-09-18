<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Patient::query()->with('creator');

        // Filtre archivés
        if ($request->has('archived')) {
            $archived = filter_var($request->input('archived'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_archived', $archived);
        } else {
            $query->where('is_archived', false);
        }

        // Recherche
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filtre genre
        if ($gender = $request->input('gender')) {
            $query->where('gender', $gender);
        }

        $perPage = (int) $request->input('per_page', 15);
        $perPage = min(max($perPage, 1), 100); // entre 1 et 100

        return PatientResource::collection(
            $query->orderByDesc('created_at')->paginate($perPage)
        );
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $patient = DB::transaction(function () use ($request) {
            return Patient::create([
                ...$request->validated(),
                'code'       => $this->generatePatientCode(),
                'created_by' => $request->user()->id,
            ]);
        });

        return (new PatientResource($patient->refresh()->load('creator')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Patient $patient): PatientResource
    {
        return new PatientResource($patient->load('creator'));
    }

    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $patient->update($request->validated());

        return new PatientResource($patient->fresh()->load('creator'));
    }

    public function destroy(Patient $patient): JsonResponse
    {
        if ($patient->is_archived) {
            return response()->json([
                'message' => 'Ce patient est déjà archivé.',
            ], 409);
        }

        $patient->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        return response()->json(['message' => 'Patient archivé avec succès.']);
    }

    /**
     * Génère un code unique au format PAT-YYYYMM-0001.
     * Sécurisé par lockForUpdate dans une transaction pour éviter les doublons.
     */
    private function generatePatientCode(): string
    {
        $prefix = 'PAT-' . now()->format('Ym') . '-';

        $lastPatient = Patient::where('code', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('code')
            ->first();

        $nextNumber = $lastPatient
            ? ((int) substr($lastPatient->code, -4)) + 1
            : 1;

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}