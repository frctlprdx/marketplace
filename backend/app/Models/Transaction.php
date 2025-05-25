<?php
// Transaction Model
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',      // Fixed: matches migration
        'user_id',
        'seller_id',
        'status',
    ];

    /**
     * Relasi ke user yang melakukan transaksi
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke seller/penjual
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Relasi ke semua item transaksi (relationship via order_id)
     */
    public function items()
    {
        return $this->hasMany(TransactionItem::class, 'order_id', 'order_id');
    }

    /**
     * Relasi ke pembayaran
     */

    /**
     * Get total amount from all items
     */
    public function getTotalAmountAttribute()
    {
        return $this->items->sum('total_price');
    }

    /**
     * Get total quantity from all items
     */
    public function getTotalQuantityAttribute()
    {
        return $this->items->sum('quantity');
    }
}