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
            'name' => 'Ivan Putra Pratama',
            'email' => 'iivanpratama16@gmail.com',
            'password' => Hash::make('essereFerrar1'), // Menggunakan password yang sudah di-hash
            'role' => 'customer',
            'address' => 'Plamongan Indah',
            'phone_number' => '081326926776',
            'remember_token' => null, // Atur sesuai kebutuhan, ini bisa null atau dihasilkan oleh Laravel
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        User::create([
        'name' => 'Seller Ivan',
        'email' => 'sellerivan@example.com',
        'password' => Hash::make('essereFerrar1'), // Menggunakan password yang sudah di-hash
        'role' => 'seller',
        'address' => 'Jl. Penjual 1',
        'phone_number' => '08987654321',
        'remember_token' => null, // Atur sesuai kebutuhan, ini bisa null atau dihasilkan oleh Laravel
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    }
}
