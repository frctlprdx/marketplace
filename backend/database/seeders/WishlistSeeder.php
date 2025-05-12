<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Wishlist;
use App\Models\User;
use App\Models\Product;

class WishlistSeeder extends Seeder
{
    public function run(): void
    {
        Wishlist::create([
            'user_id' => 1,
            'product_id' => 1,
        ]);

        Wishlist::create([
            'user_id' => 1,
            'product_id' => 2,
        ]);
    }
}
