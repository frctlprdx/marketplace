<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;

class TransactionsTableSeeder extends Seeder
{
    public function run()
    {
        Transaction::create([
            'transaction_item' => 1, // kode transaksi
            'user_id'          => 1, // ID customer
            'seller_id'        => 2, // ID seller
            'status'           => 'paid',
        ]);
    }
}
