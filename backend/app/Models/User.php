<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'address',
        'phone_number',
        'profileimage',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Menambahkan akses role untuk kontrol lebih
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSeller()
    {
        return $this->role === 'seller';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function addresses()
    {
        return $this->hasMany(UserShippingAddress::class);
    }

    public function defaultAddress()
    {
        return $this->hasOne(UserShippingAddress::class)->where('is_default', true);
    }


}

