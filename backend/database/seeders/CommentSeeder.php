<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        // Pastikan ada user & product terlebih dahulu
        if ($users->count() === 0 || $products->count() === 0) {
            $this->command->warn('Tidak ada users atau products, seeder Comment tidak dijalankan.');
            return;
        }

        foreach ($products as $product) {
            Comment::create([
                'product_id' => $product->id,
                'user_id' => $users->random()->id,
                'content' => 'Produk ini sangat bagus!',
            ]);

            Comment::create([
                'product_id' => $product->id,
                'user_id' => $users->random()->id,
                'content' => 'Saya suka kualitasnya.',
            ]);
        }
    }
}
