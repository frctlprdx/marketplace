<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'total',
    ];

    /**
     * Relasi ke user yang melakukan transaksi
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke item transaksi
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
