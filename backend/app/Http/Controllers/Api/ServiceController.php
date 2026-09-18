<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Service::query()->withCount('doctors');

        if ($request->has('active')) {
            $active = filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $active);
        }

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

        return ServiceResource::collection(
            $query->orderBy('name')->paginate($perPage)
        );
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());

        return (new ServiceResource($service->refresh()->loadCount('doctors')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Service $service): ServiceResource
    {
        return new ServiceResource($service->loadCount('doctors'));
    }

    public function update(UpdateServiceRequest $request, Service $service): ServiceResource
    {
        $service->update($request->validated());

        return new ServiceResource($service->fresh()->loadCount('doctors'));
    }

    public function destroy(Service $service): JsonResponse
    {
        if ($service->doctors()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce service : des médecins y sont rattachés.',
            ], 409);
        }

        $service->delete();

        return response()->json(['message' => 'Service supprimé.']);
    }
}