<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default Admin
        User::updateOrCreate(
            ['email' => 'admin@kesling.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // Default Regular User
        // User::updateOrCreate(
        //     ['email' => 'user@kesling.com'],
        //     [
        //         'name'     => 'Petugas Kesling',
        //         'password' => Hash::make('password'),
        //         'role'     => 'user',
        //     ]
        // );

        // User::factory()->count(5)->create();
    }
}
