<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Product::create([
            'user_id' => 2, // Seller Satu
            'name' => 'Kaos Polos',
            'description' => 'Kaos polos bahan katun',
            'stocks' => 50,
            'price' => 75000,
            'image' => 'kaos.jpg'
        ]);

        Product::create([
            'user_id' => 2,
            'name' => 'Topi Keren',
            'description' => 'Topi untuk gaya casual',
            'stocks' => 30,
            'price' => 50000,
            'image' => 'topi.jpg'
        ]);
    }
}
