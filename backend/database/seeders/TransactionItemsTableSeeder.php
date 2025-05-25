<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransactionItem;

class TransactionItemsTableSeeder extends Seeder
{
    public function run()
    {
        TransactionItem::create([
            'order_id' => 'avs',
            'product_id' => 1,
            'quantity' => 1,
            'total_price' => 650000000,
            'courier' => 'J&T Express',
            'destination_id' => 1,
        ]);
    }
}
