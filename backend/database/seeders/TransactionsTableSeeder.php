<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;

class TransactionsTableSeeder extends Seeder
{
    public function run()
    {
        Transaction::create([
            'order_id' => 'avs',
            'user_id' => 1, // ID pengguna yang melakukan transaksi
            'seller_id' => 2, // ID penjual yang menerima transaksi
            'status' => 'paid', // Status awal transaksi
        ]);
    }
}
