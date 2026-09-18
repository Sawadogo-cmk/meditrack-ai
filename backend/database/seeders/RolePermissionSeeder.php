<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'admin' => ['*'],
            'doctor' => [
                'appointments.view', 'consultations.create', 'consultations.view',
                'medical_records.view', 'patients.view', 'dashboard.view',
            ],
            'secretary' => [
                'patients.view', 'patients.create', 'patients.update',
                'appointments.view', 'appointments.create', 'appointments.update',
                'appointments.cancel', 'dashboard.view',
            ],
            'patient' => [
                'appointments.view', 'appointments.create',
            ],
        ];

        foreach ($map as $roleName => $codes) {
            $role = Role::where('name', $roleName)->first();
            if (! $role) continue;

            if ($codes === ['*']) {
                $role->permissions()->sync(Permission::pluck('id'));
            } else {
                $role->permissions()->sync(
                    Permission::whereIn('code', $codes)->pluck('id')
                );
            }
        }
    }
}