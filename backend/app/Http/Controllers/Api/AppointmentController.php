<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Requests\UpdateAppointmentStatusRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AppointmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Appointment::query()->with(['patient', 'doctor.user', 'service']);

        // Filtre statut
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filtre doctor
        if ($doctorId = $request->input('doctor_id')) {
            $query->where('doctor_id', $doctorId);
        }

        // Filtre patient
        if ($patientId = $request->input('patient_id')) {
            $query->where('patient_id', $patientId);
        }

        // Filtre service
        if ($serviceId = $request->input('service_id')) {
            $query->where('service_id', $serviceId);
        }

        // Filtre date (jour précis)
        if ($date = $request->input('date')) {
            $query->whereDate('scheduled_at', $date);
        }

        // Filtre plage
        if ($from = $request->input('from')) {
            $query->where('scheduled_at', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->where('scheduled_at', '<=', $to);
        }

        // Tri
        $sort = $request->input('sort', 'asc'); // asc ou desc
        $query->orderBy('scheduled_at', $sort === 'desc' ? 'desc' : 'asc');

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return AppointmentResource::collection($query->paginate($perPage));
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = Appointment::create([
            ...$request->validated(),
            'duration_minutes' => $request->input('duration_minutes', 30),
            'status'           => 'pending',
            'created_by'       => $request->user()->id,
        ]);

        return (new AppointmentResource(
            $appointment->load(['patient', 'doctor.user', 'service'])
        ))->response()->setStatusCode(201);
    }

    public function show(Appointment $appointment): AppointmentResource
    {
        return new AppointmentResource(
            $appointment->load(['patient', 'doctor.user', 'service'])
        );
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): AppointmentResource
    {
        $appointment->update($request->validated());

        return new AppointmentResource(
            $appointment->fresh()->load(['patient', 'doctor.user', 'service'])
        );
    }

    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): AppointmentResource
    {
        $appointment->update(['status' => $request->input('status')]);

        return new AppointmentResource(
            $appointment->fresh()->load(['patient', 'doctor.user', 'service'])
        );
    }

    /**
     * Annule le rendez-vous (jamais de suppression physique).
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        if (in_array($appointment->status, ['cancelled', 'completed', 'no_show'])) {
            return response()->json([
                'message' => "Ce rendez-vous ne peut plus être annulé (statut : {$appointment->status}).",
            ], 409);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Rendez-vous annulé.']);
    }
}