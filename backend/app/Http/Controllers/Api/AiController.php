<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(private AiService $ai)
    {
    }

    /**
     * Prévisions de charge par service.
     */
    public function predictions(Request $request): JsonResponse
    {
        $daysHistory = min(max((int) $request->input('days_history', 90), 30), 180);
        $daysFuture = min(max((int) $request->input('days_future', 7), 1), 30);

        $data = $this->ai->predictServiceLoad($daysHistory, $daysFuture);

        if ($data === null) {
            return response()->json([
                'message' => 'Service IA indisponible.',
            ], 503);
        }

        return response()->json($data);
    }

    /**
     * Tendances et alertes.
     */
    public function trends(Request $request): JsonResponse
    {
        $daysHistory = min(max((int) $request->input('days_history', 60), 30), 180);

        $data = $this->ai->trends($daysHistory);

        if ($data === null) {
            return response()->json([
                'message' => 'Service IA indisponible.',
            ], 503);
        }

        return response()->json($data);
    }
}