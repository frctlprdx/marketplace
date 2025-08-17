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
    'description',
    'stocks',
    'price',
    'image',
    'product_url',
    'show'
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

    public function reduceStock($quantity)
    {
        $this->stocks -= $quantity;
        $this->save();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}


