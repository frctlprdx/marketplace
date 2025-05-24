<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'amount',
        'total_price',
        'courier',
        'destination',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relasi ke alamat pengiriman.
     */
    public function shippingAddress()
    {
        return $this->belongsTo(UserShippingAddress::class, 'destination');
    }
}
