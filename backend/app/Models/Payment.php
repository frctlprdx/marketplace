<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'method',
        'status',
        'external_id',
        'paid_at',
    ];

    /**
     * Relasi ke transaksi
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

}
