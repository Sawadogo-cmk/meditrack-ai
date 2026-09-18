<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DashboardController extends Controller
{
    /**
     * Statistiques globales pour le tableau de bord.
     */
    public function stats(Request $request): JsonResponse
    {
        $this->authorizeDashboard($request);

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfWeek = $now->copy()->startOfWeek();

        // --- Patients ---
        $patientsTotal = Patient::count();
        $patientsArchived = Patient::where('is_archived', true)->count();
        $patientsActive = $patientsTotal - $patientsArchived;
        $patientsNewThisMonth = Patient::where('created_at', '>=', $startOfMonth)->count();

        // --- Doctors ---
        $doctorsTotal = Doctor::count();
        $doctorsActive = Doctor::where('is_available', true)
            ->whereHas('user', fn ($q) => $q->where('is_active', true))
            ->count();
        $doctorsInactive = $doctorsTotal - $doctorsActive;

        // --- Appointments ---
        $appointmentsToday = Appointment::whereDate('scheduled_at', $now->toDateString())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->count();

        $appointmentsUpcoming = Appointment::where('scheduled_at', '>', $now)
            ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
            ->count();

        $appointmentsByStatus = Appointment::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $appointmentsThisMonth = Appointment::where('scheduled_at', '>=', $startOfMonth)->count();

        // --- Consultations ---
        $consultationsTotal = Consultation::count();
        $consultationsThisMonth = Consultation::where('consultation_date', '>=', $startOfMonth)->count();
        $consultationsThisWeek = Consultation::where('consultation_date', '>=', $startOfWeek)->count();

        // --- Services + Distribution (option A) ---
        $servicesTotal = Service::count();
        $servicesActive = Service::where('is_active', true)->count();

        $servicesDistribution = Service::query()
            ->withCount([
                'doctors',
                'appointments' => function ($q) {
                    $q->whereNotIn('status', ['cancelled', 'no_show']);
                },
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Service $service) {
                $doctorsCount = $service->doctors_count;
                $appointmentsCount = $service->appointments_count;

                // Ratio RDV/médecin — indicateur de tension
                $ratio = $doctorsCount > 0
                    ? round($appointmentsCount / $doctorsCount, 2)
                    : null;

                return [
                    'id'                 => $service->id,
                    'name'               => $service->name,
                    'is_active'          => (bool) $service->is_active,
                    'doctors_count'      => $doctorsCount,
                    'appointments_count' => $appointmentsCount,
                    'appointments_per_doctor' => $ratio,
                    'load_level'         => $this->computeLoadLevel($doctorsCount, $appointmentsCount),
                ];
            });

        return response()->json([
            'generated_at' => $now->toIso8601String(),
            'patients' => [
                'total'           => $patientsTotal,
                'active'          => $patientsActive,
                'archived'        => $patientsArchived,
                'new_this_month'  => $patientsNewThisMonth,
            ],
            'doctors' => [
                'total'    => $doctorsTotal,
                'active'   => $doctorsActive,
                'inactive' => $doctorsInactive,
            ],
            'appointments' => [
                'today'         => $appointmentsToday,
                'upcoming'      => $appointmentsUpcoming,
                'this_month'    => $appointmentsThisMonth,
                'pending'       => $appointmentsByStatus['pending'] ?? 0,
                'confirmed'     => $appointmentsByStatus['confirmed'] ?? 0,
                'completed'     => $appointmentsByStatus['completed'] ?? 0,
                'cancelled'     => $appointmentsByStatus['cancelled'] ?? 0,
                'no_show'       => $appointmentsByStatus['no_show'] ?? 0,
            ],
            'consultations' => [
                'total'       => $consultationsTotal,
                'this_month'  => $consultationsThisMonth,
                'this_week'   => $consultationsThisWeek,
            ],
            'services' => [
                'total'        => $servicesTotal,
                'active'       => $servicesActive,
                'distribution' => $servicesDistribution,
            ],
        ]);
    }

    /**
     * Rendez-vous du jour.
     */
    public function appointmentsToday(Request $request): AnonymousResourceCollection
    {
        $this->authorizeDashboard($request);

        $query = Appointment::query()
            ->with(['patient', 'doctor.user', 'service'])
            ->whereDate('scheduled_at', now()->toDateString())
            ->orderBy('scheduled_at');

        return AppointmentResource::collection($query->get());
    }

    /**
     * Prochains rendez-vous (par défaut : 7 jours).
     */
    public function appointmentsUpcoming(Request $request): AnonymousResourceCollection
    {
        $this->authorizeDashboard($request);

        $days = min(max((int) $request->input('days', 7), 1), 90);

        $from = now();
        $to = now()->addDays($days);

        $query = Appointment::query()
            ->with(['patient', 'doctor.user', 'service'])
            ->whereBetween('scheduled_at', [$from, $to])
            ->whereNotIn('status', ['cancelled', 'no_show', 'completed'])
            ->orderBy('scheduled_at');

        return AppointmentResource::collection($query->get());
    }

    /**
     * Seuls admin, doctor et secretary peuvent consulter le dashboard.
     */
    private function authorizeDashboard(Request $request): void
    {
        $user = $request->user();
        $role = $user?->role?->name;

        if (! in_array($role, ['admin', 'doctor', 'secretary'], true)) {
            abort(403, 'Accès non autorisé au tableau de bord.');
        }
    }

    /**
     * Calcule un niveau de charge pour un service (pour visualisation UI).
     */
    private function computeLoadLevel(int $doctorsCount, int $appointmentsCount): string
    {
        if ($doctorsCount === 0) {
            return $appointmentsCount > 0 ? 'no_doctor' : 'idle';
        }

        $ratio = $appointmentsCount / $doctorsCount;

        return match (true) {
            $ratio >= 20 => 'high',
            $ratio >= 10 => 'medium',
            $ratio >= 1  => 'low',
            default      => 'idle',
        };
    }
}