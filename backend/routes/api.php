<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Ressources
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('services', ServiceController::class);
});