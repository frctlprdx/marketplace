<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;

class PaymentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Payment::create([
            'transaction_id' => 1,
            'method' => 'manual_transfer',
            'status' => 'paid',
            'external_id' => 'INV-20250418-001',
            'paid_at' => now()
        ]);
    }
}
