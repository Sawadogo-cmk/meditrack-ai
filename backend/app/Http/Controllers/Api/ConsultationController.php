<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsultationRequest;
use App\Http\Requests\UpdateConsultationRequest;
use App\Http\Resources\ConsultationResource;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\MedicalRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Consultation::query()->with(['patient', 'doctor.user', 'appointment']);

        if ($patientId = $request->input('patient_id')) {
            $query->where('patient_id', $patientId);
        }

        if ($doctorId = $request->input('doctor_id')) {
            $query->where('doctor_id', $doctorId);
        }

        if ($from = $request->input('from')) {
            $query->where('consultation_date', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->where('consultation_date', '<=', $to);
        }

        $sort = $request->input('sort', 'desc');
        $query->orderBy('consultation_date', $sort === 'asc' ? 'asc' : 'desc');

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return ConsultationResource::collection($query->paginate($perPage));
    }

    public function store(StoreConsultationRequest $request): JsonResponse
    {
        $consultation = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['consultation_date'] = $data['consultation_date'] ?? now();

            $consultation = Consultation::create($data);

            // Si la consultation est liée à un RDV, on le passe en 'completed'
            if ($consultation->appointment_id) {
                Appointment::where('id', $consultation->appointment_id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->update(['status' => 'completed']);
            }

            // Créer automatiquement l'entrée dans le dossier médical
            $doctorName = $consultation->doctor?->user
                ? "Dr {$consultation->doctor->user->first_name} {$consultation->doctor->user->last_name}"
                : 'Médecin';

            $title = 'Consultation du '
                . $consultation->consultation_date->format('d/m/Y')
                . ' — ' . $doctorName;

            $description = collect([
                $consultation->diagnostic ? "Diagnostic : {$consultation->diagnostic}" : null,
                $consultation->traitement ? "Traitement : {$consultation->traitement}" : null,
            ])->filter()->implode("\n\n");

            MedicalRecord::create([
                'patient_id'      => $consultation->patient_id,
                'consultation_id' => $consultation->id,
                'record_type'     => 'consultation',
                'title'           => $title,
                'description'     => $description ?: null,
                'record_date'     => $consultation->consultation_date,
                'created_by'      => $request->user()->id,
            ]);

            return $consultation;
        });

        return (new ConsultationResource(
            $consultation->load(['patient', 'doctor.user', 'appointment'])
        ))->response()->setStatusCode(201);
    }

    public function show(Consultation $consultation): ConsultationResource
    {
        return new ConsultationResource(
            $consultation->load(['patient', 'doctor.user', 'appointment'])
        );
    }

    public function update(UpdateConsultationRequest $request, Consultation $consultation): ConsultationResource
    {
        $consultation->update($request->validated());

        // On met à jour le dossier médical lié
        $consultation->medicalRecords->each(function (MedicalRecord $record) use ($consultation) {
            $description = collect([
                $consultation->diagnostic ? "Diagnostic : {$consultation->diagnostic}" : null,
                $consultation->traitement ? "Traitement : {$consultation->traitement}" : null,
            ])->filter()->implode("\n\n");

            $record->update([
                'description' => $description ?: null,
                'record_date' => $consultation->consultation_date,
            ]);
        });

        return new ConsultationResource(
            $consultation->fresh()->load(['patient', 'doctor.user', 'appointment'])
        );
    }

    /**
     * Pas de suppression physique. Les consultations sont des actes médicaux
     * qui doivent rester dans le dossier du patient.
     */
    public function destroy(Consultation $consultation): JsonResponse
    {
        return response()->json([
            'message' => 'Une consultation ne peut pas être supprimée. Elle fait partie du dossier médical.',
        ], 405);
    }
}