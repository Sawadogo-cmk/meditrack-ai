<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicalRecordController;
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
    Route::apiResource('doctors', DoctorController::class);

    // Dossier médical d'un patient
    Route::get('patients/{patient}/medical-records', [MedicalRecordController::class, 'indexByPatient'])
        ->name('patients.medical-records');

    // Rendez-vous : route custom AVANT apiResource
    Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('appointments.update-status');
    Route::apiResource('appointments', AppointmentController::class);

    // Consultations
    Route::apiResource('consultations', ConsultationController::class);
});