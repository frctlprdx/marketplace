<?php
// TransactionItem Model
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',        // Fixed: matches migration
        'product_id',
        'quantity',        // Fixed: matches migration (was 'amount')
        'unit_price',      // Added: matches migration
        'total_price',
        'courier',
        'destination_id',  // Fixed: matches migration (was 'destination')
    ];

    /**
     * Relasi ke transaction via order_id
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'order_id', 'order_id');
    }

    /**
     * Relasi ke product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relasi ke alamat pengiriman
     */
    public function destination()
    {
        return $this->belongsTo(UserShippingAddress::class, 'destination_id');
    }

    /**
     * Alias for destination (more descriptive)
     */
    public function shippingAddress()
    {
        return $this->destination();
    }

    /**
     * Calculate total price automatically
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (!$item->total_price && $item->quantity && $item->unit_price) {
                $item->total_price = $item->quantity * $item->unit_price;
            }
        });

        static::updating(function ($item) {
            if ($item->isDirty(['quantity', 'unit_price'])) {
                $item->total_price = $item->quantity * $item->unit_price;
            }
        });
    }
}