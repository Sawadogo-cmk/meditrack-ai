<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        User::updateOrCreate(
            ['email' => 'admin@meditrack.test'],
            [
                'first_name' => 'Admin',
                'last_name' => 'MediTrack',
                'password' => Hash::make('password'),
                'is_active' => true,
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]
        );
    }
}