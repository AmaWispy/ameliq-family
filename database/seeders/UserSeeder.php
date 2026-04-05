<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Alexey', 'email' => 'alexey@ameliq.ru'],
            ['name' => 'Victoria', 'email' => 'victoria@ameliq.ru'],
        ];

        foreach ($users as $user) {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('qwerty'),
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
