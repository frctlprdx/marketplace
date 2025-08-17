<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    
    public $timestamps = false; // karena tidak ada created_at dan updated_at di migration
    
    protected $fillable = ['name'];
    
    // Relasi ke products
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}