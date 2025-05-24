<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_item',
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
     * Relasi ke item utama transaksi (1 item)
     */
    public function mainItem()
    {
        return $this->belongsTo(TransactionItem::class, 'transaction_item');
    }

    /**
     * Relasi ke semua item transaksi (banyak)
     */
    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Relasi ke pembayaran
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
