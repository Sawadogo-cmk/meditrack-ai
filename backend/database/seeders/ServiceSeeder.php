<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Médecine générale', 'description' => 'Consultations générales'],
            ['name' => 'Pédiatrie', 'description' => 'Santé des enfants'],
            ['name' => 'Maternité', 'description' => 'Suivi de grossesse et accouchement'],
            ['name' => 'Cardiologie', 'description' => 'Maladies du cœur'],
            ['name' => 'Laboratoire', 'description' => 'Analyses médicales'],
            ['name' => 'Radiologie', 'description' => 'Imagerie médicale'],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['name' => $service['name']], $service);
        }
    }
}