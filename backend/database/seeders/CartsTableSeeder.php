<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cart;

class CartsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Cart::create([
            'user_id' => 1, // Ivan Customer
            'product_id' => 1,
            'quantity' => 1
        ]);

        Cart::create([
            'user_id' => 1,
            'product_id' => 2,
            'quantity' => 1
        ]);
    }
}
