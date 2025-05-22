<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductsTableSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Audemars Piguet Royal Oak Rose Gold',
                'description' => 'Jam tangan mewah dengan desain klasik dan material emas rose gold.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 270.00, // gram
                'rating' => 5.0,
                'price' => 650000000, // Rp650.000.000
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/aprosegold.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Audemars Piguet Royal Oak',
                'description' => 'Jam tangan ikonik dengan desain octagonal dan finishing mewah.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 270.00,
                'rating' => 5.0,
                'price' => 600000000,
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/aproyaloak.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Rolex Cosmograph Daytona',
                'description' => 'Jam tangan kronograf legendaris dengan presisi tinggi.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 138.00,
                'rating' => 5.0,
                'price' => 400000000,
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/cosmographdaytona.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Patek Philippe Grandmaster Chime',
                'description' => 'Jam tangan paling kompleks dengan fitur chiming dan desain eksklusif.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 1000.00,
                'rating' => 5.0,
                'price' => 50000000000,
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/gmchime.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Rolex GMT-Master II Pepsi',
                'description' => 'Jam tangan dengan bezel merah-biru ikonik dan fungsi GMT.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 154.00,
                'rating' => 5.0,
                'price' => 700000000,
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/gmtpepsi.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Patek Philippe Nautilus Blue Dial',
                'description' => 'Jam tangan sporty-elegan dengan dial biru khas dan desain ramping.',
                'stocks' => 1,
                'sold' => 0,
                'weight' => 150.00,
                'rating' => 5.0,
                'price' => 3000000000,
                'image' => 'https://bllwkvhdvpklldubcotn.supabase.co/storage/v1/object/public/nogosarenmarketplace/produk/nautilusblue.jpg',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
