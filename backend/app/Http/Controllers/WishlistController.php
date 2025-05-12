<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user(); // Mendapatkan pengguna yang sedang login
            // Cek apakah user memiliki role 'customer'
            if ($user->role !== 'customer') {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $userId = $request->input('user_id');

            // Cek apakah user_id diterima
            if (!$userId) {
                return response()->json(['error' => 'user_id is required'], 400);
            }

            $wishlists = DB::table('wishlists')
                ->join('products', 'wishlists.product_id', '=', 'products.id')
                ->join('users', 'wishlists.user_id', '=', 'users.id')
                ->where('wishlists.user_id', $userId)
                ->select('wishlists.*', 'products.*', 'users.name as user_name')
                ->get();

            return response()->json($wishlists);
        } catch (\Exception $e) {
            // Menangkap dan menampilkan error
            return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
        }
    }



}
