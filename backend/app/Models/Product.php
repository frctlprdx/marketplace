<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'category_id',
        'sold',
        'weight',
        'rating',
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

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}


