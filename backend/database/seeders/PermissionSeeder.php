<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['code' => 'users.manage', 'label' => 'Gérer les utilisateurs et rôles'],
            ['code' => 'services.manage', 'label' => 'Gérer les services médicaux'],
            ['code' => 'doctors.manage', 'label' => 'Gérer les médecins'],
            ['code' => 'patients.view', 'label' => 'Consulter les patients'],
            ['code' => 'patients.create', 'label' => 'Créer un patient'],
            ['code' => 'patients.update', 'label' => 'Modifier un patient'],
            ['code' => 'patients.archive', 'label' => 'Archiver un patient'],
            ['code' => 'appointments.view', 'label' => 'Consulter les rendez-vous'],
            ['code' => 'appointments.create', 'label' => 'Créer un rendez-vous'],
            ['code' => 'appointments.update', 'label' => 'Modifier un rendez-vous'],
            ['code' => 'appointments.cancel', 'label' => 'Annuler un rendez-vous'],
            ['code' => 'consultations.create', 'label' => 'Enregistrer une consultation'],
            ['code' => 'consultations.view', 'label' => 'Consulter les consultations'],
            ['code' => 'medical_records.view', 'label' => 'Consulter les dossiers médicaux'],
            ['code' => 'dashboard.view', 'label' => 'Accéder au tableau de bord'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['code' => $permission['code']], $permission);
        }
    }
}