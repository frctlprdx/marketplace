<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserShippingAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'recipient_name',
        'phone',
        'province',
        'city',
        'district',
        'subdistrict',
        'zip_code',
        'detail_address',
        'is_default',
    ];

    /**
     * Relasi: Alamat milik seorang user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
