<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;

class CartController extends Controller
{
    public function index(Request $request)
    {
        // Cek apakah user sudah login
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Please login to access the cart',
            ], 401); // Mengembalikan response dengan status 401 Unauthorized
        }

        // Jika user sudah login, ambil data cart
        $carts = Cart::with('product') // Mengambil relasi product
                    ->join('users', 'carts.user_id', '=', 'users.id') // Join dengan tabel users
                    ->join('products', 'carts.product_id', '=', 'products.id') // Join dengan tabel products
                    ->where('carts.user_id', Auth::id()) // Filter berdasarkan user_id
                    ->select('carts.*', 'users.name as user_name', 'products.name as product_name') // Ambil data yang dibutuhkan
                    ->get();
        
        // Mengembalikan data cart jika sudah login
        return response()->json([
            'success' => true,
            'data' => $carts,
        ]);
    }


}

