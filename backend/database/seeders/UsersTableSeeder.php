<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Ivan Customer',
            'email' => 'ivan_customer@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'address' => 'Jl. Contoh No. 123',
            'phone_number' => '08123456789',
        ]);

        User::create([
            'name' => 'Seller Satu',
            'email' => 'seller@example.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
            'address' => 'Jl. Penjual 1',
            'phone_number' => '08987654321',
        ]);
    }
}
