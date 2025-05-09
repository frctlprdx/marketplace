<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        // Ambil user_id dari request
        $userId = $request->input('user_id');

        // Lakukan join antara tabel 'wishlists' dan 'products' berdasarkan product_id dan filter berdasarkan user_id
        $wishlists = DB::table('wishlists')
            ->join('products', 'wishlists.product_id', '=', 'products.id') // Menggabungkan tabel 'wishlists' dengan 'products'
            ->where('wishlists.user_id', $userId) // Filter berdasarkan user_id
            ->select('wishlists.*', 'products.*') // Pilih semua kolom dari wishlists dan products
            ->get();

        return response()->json($wishlists);
    }


}
