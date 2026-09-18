<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Requests\UpdateDoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DoctorController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Doctor::query()->with(['user', 'service']);

        // Par défaut : uniquement les doctors actifs
        $includeInactive = filter_var(
            $request->input('include_inactive', false),
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $includeInactive) {
            $query->where('is_available', true)
                  ->whereHas('user', fn ($q) => $q->where('is_active', true));
        }

        // Filtre service
        if ($serviceId = $request->input('service_id')) {
            $query->where('service_id', $serviceId);
        }

        // Filtre spécialité (recherche partielle)
        if ($speciality = $request->input('speciality')) {
            $query->where('speciality', 'like', "%{$speciality}%");
        }

        // Recherche par nom/prénom/email du user
        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return DoctorResource::collection(
            $query->orderByDesc('created_at')->paginate($perPage)
        );
    }

    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $doctor = DB::transaction(function () use ($request) {
            $doctorRole = Role::where('name', 'doctor')->firstOrFail();

            $user = User::create([
                'email'      => $request->email,
                'password'   => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'phone'      => $request->phone,
                'is_active'  => true,
                'role_id'    => $doctorRole->id,
            ]);

            return Doctor::create([
                'user_id'      => $user->id,
                'speciality'   => $request->speciality,
                'service_id'   => $request->service_id,
                'office_phone' => $request->office_phone,
                'is_available' => $request->boolean('is_available', true),
            ]);
        });

        return (new DoctorResource($doctor->load(['user', 'service'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Doctor $doctor): DoctorResource
    {
        return new DoctorResource($doctor->load(['user', 'service']));
    }

    public function update(UpdateDoctorRequest $request, Doctor $doctor): DoctorResource
    {
        DB::transaction(function () use ($request, $doctor) {
            $doctorData = $request->only([
                'speciality', 'service_id', 'office_phone', 'is_available',
            ]);

            $userData = $request->only([
                'email', 'first_name', 'last_name', 'phone', 'is_active',
            ]);

            if (! empty($doctorData)) {
                $doctor->update($doctorData);
            }

            if (! empty($userData)) {
                $doctor->user->update($userData);
            }
        });

        return new DoctorResource($doctor->fresh()->load(['user', 'service']));
    }

    /**
     * Désactive le doctor et son compte User (jamais de suppression physique).
     */
    public function destroy(Doctor $doctor): JsonResponse
    {
        if (! $doctor->is_available && ! $doctor->user->is_active) {
            return response()->json([
                'message' => 'Ce médecin est déjà désactivé.',
            ], 409);
        }

        DB::transaction(function () use ($doctor) {
            $doctor->update(['is_available' => false]);
            $doctor->user->update(['is_active' => false]);
        });

        return response()->json([
            'message' => 'Médecin désactivé avec succès. L’historique médical est préservé.',
        ]);
    }
}