<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'stocks',
        'price',
        'image',
    ];

    /**
     * Produk ini ada di banyak cart
     */
    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Produk ini muncul di banyak transaksi
     */
    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function reduceStock($quantity)
    {
        $this->stocks -= $quantity;
        $this->save();
    }
}


