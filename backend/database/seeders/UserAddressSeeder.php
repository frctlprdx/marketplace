<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserShippingAddress;

class UserAddressSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first(); // asumsikan sudah ada user

        UserShippingAddress::create([
            'user_id' => 1,
            'label' => 'Rumah',
            'recipient_name' => "Ivan Pratama",
            'phone' => '081326926776',
            'province' => 'Jawa Tengah',
            'city' => 'Semarang',
            'district' => 'Pedurungan',
            'subdistrict' => 'Plamongansari',
            'zip_code' => '901913',
            'detail_address' => 'Jl. Plamongan Indah Blok C 40',
            'is_default' => true,
        ]);
    }
}
