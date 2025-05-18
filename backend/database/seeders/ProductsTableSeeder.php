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
        $products = [
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Topi',
                'description' => 'Topi Baseball',
                'stocks' => 50,
                'sold' => 10,
                'rating' => 4.5,
                'price' => 75000,
                'image' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRin7EU9TwzmKdgte_U9iaYlLpA53UBaPH6gA&s',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Celana',
                'description' => 'Celana Jeans',
                'stocks' => 30,
                'sold' => 5,
                'rating' => 4.0,
                'price' => 50000,
                'image' => 'https://cdn.shopify.com/s/files/1/0560/4619/0725/files/Mens_Slim.jpg?v=1702299585&width=400',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Kaos',
                'description' => 'Kaos Oblong',
                'stocks' => 30,
                'sold' => 8,
                'rating' => 4.2,
                'price' => 50000,
                'image' => 'https://down-id.img.susercontent.com/file/dbdbb9f6065ff8f272ad6cebea567087',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Sepatu',
                'description' => 'Sepatu Putih',
                'stocks' => 30,
                'sold' => 7,
                'rating' => 4.8,
                'price' => 50000,
                'image' => 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//98/MTA-48042853/no_brand_sepatu__sneakers_cewek_tali_putih_polos_premium_kualitas_bagus_untuk_hangout_full07_r4mvesfx.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Kaos Kaki',
                'description' => 'Kaos Kaki Belang',
                'stocks' => 30,
                'sold' => 3,
                'rating' => 3.9,
                'price' => 50000,
                'image' => 'https://down-id.img.susercontent.com/file/sg-11134201-22100-ui4a15s0g5iv16',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Gelang',
                'description' => 'Gelang Kayu',
                'stocks' => 30,
                'sold' => 4,
                'rating' => 4.1,
                'price' => 50000,
                'image' => 'https://images.tokopedia.net/img/cache/500-square/VqbcmM/2021/6/22/49c39f0a-565b-490b-b31c-7b64f4482a70.jpg',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Kacamata',
                'description' => 'Kacamata minus',
                'stocks' => 30,
                'sold' => 6,
                'rating' => 4.3,
                'price' => 50000,
                'image' => 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/5/24/df16d629-1dc3-4b46-9da6-b35e3672592d.png',
            ],
            [
                'user_id' => 2,
                'category_id' => 2,
                'name' => 'Masker',
                'description' => 'Masker Wajah',
                'stocks' => 30,
                'sold' => 9,
                'rating' => 4.6,
                'price' => 50000,
                'image' => 'https://images.tokopedia.net/img/cache/700/product-1/2021/7/11/956929/956929_401c3935-296c-420e-b194-1fb1780230d9.jpg',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
