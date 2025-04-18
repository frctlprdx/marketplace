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
            return redirect('/login'); // Redirect ke login jika user belum login
        }

        // Cek role user
        $user = Auth::user();
        
        if ($user->role == 'customer') {
            // Tampilkan cart untuk customer
            $carts = Cart::with('product')
                        ->join('users', 'carts.user_id', '=', 'users.id')
                        ->join('products', 'carts.product_id', '=', 'products.id')
                        ->where('carts.user_id', $user->id)
                        ->select('carts.*', 'users.name as user_name', 'products.name as product_name')
                        ->get();
            return response()->json([
                'success' => true,
                'data' => $carts,
            ]);
        } elseif ($user->role == 'seller') {
            // Tampilkan halaman seller
            return redirect()->route('seller.index'); // Redirect ke halaman dashboard seller
        } else {
            return redirect('/unauthorized'); // Halaman error jika role tidak dikenali
        }
    }                           



}

