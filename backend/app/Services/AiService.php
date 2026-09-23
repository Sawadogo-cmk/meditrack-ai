<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ai.url', 'http://localhost:8001');
    }

    /**
     * Prévisions de charge par service.
     */
    public function predictServiceLoad(int $daysHistory = 90, int $daysFuture = 7): ?array
    {
        return $this->get('/predict/service-load', [
            'days_history' => $daysHistory,
            'days_future' => $daysFuture,
        ]);
    }

    /**
     * Tendances et alertes.
     */
    public function trends(int $daysHistory = 60): ?array
    {
        return $this->get('/predict/trends', [
            'days_history' => $daysHistory,
        ]);
    }

    /**
     * Requête GET générique vers le service IA.
     */
    private function get(string $path, array $query = []): ?array
    {
        try {
            $response = Http::timeout(10)
                ->acceptJson()
                ->get($this->baseUrl . $path, $query);

            if ($response->failed()) {
                Log::warning("AI service error: {$path}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error("AI service unreachable: {$path}", [
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }
}