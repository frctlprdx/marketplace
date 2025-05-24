<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransactionItem;

class TransactionItemsTableSeeder extends Seeder
{
    public function run()
    {
        TransactionItem::create([
            'product_id' => 1,
            'amount' => 2,
            'total_price' => 75000,
            'courier' => 'JNE',
            'destination' => 1, // ID dari UserShippingAddress
        ]);
    }
}
