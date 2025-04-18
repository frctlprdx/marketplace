<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TransactionItem;

class TransactionItemsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        TransactionItem::create([
            'transaction_id' => 1,
            'product_id' => 1,
            'amount' => 2,
            'price' => 75000
        ]);

        TransactionItem::create([
            'transaction_id' => 1,
            'product_id' => 2,
            'amount' => 1,
            'price' => 50000
        ]);
    }
}
