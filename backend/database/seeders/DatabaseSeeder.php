<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UsersTableSeeder::class,
            ProductsTableSeeder::class,
            CartsTableSeeder::class,
            TransactionsTableSeeder::class,
            TransactionItemsTableSeeder::class,
            PaymentsTableSeeder::class,
            WishlistSeeder::class,
        ]);
    }
}
