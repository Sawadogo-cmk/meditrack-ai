<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin', 'label' => 'Administrateur', 'description' => 'Gestion complète de la plateforme'],
            ['name' => 'doctor', 'label' => 'Médecin', 'description' => 'Consultations et suivi médical'],
            ['name' => 'secretary', 'label' => 'Agent d\'accueil / Secrétaire', 'description' => 'Gestion des patients et des rendez-vous'],
            ['name' => 'patient', 'label' => 'Patient', 'description' => 'Accès partiel à son dossier'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}