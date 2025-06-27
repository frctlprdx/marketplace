<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;

class CartController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Cek apakah user memiliki role 'customer'
            if ($user->role !== 'customer') {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $userId = $user->id;

            $carts = DB::table('carts')
            ->join('products', 'carts.product_id', '=', 'products.id')
            ->join('users as buyers', 'carts.user_id', '=', 'buyers.id') // alias pembeli
            ->join('users as sellers', 'products.user_id', '=', 'sellers.id') // alias penjual
            ->where('carts.user_id', 1)
            ->select(
                'carts.*',
                'products.*',
                'products.user_id as seller_id',
                'sellers.name as seller_name',               // ✅ penjual
                'sellers.profileimage as seller_profile',    // ✅ penjual
                'buyers.name as user_name'                   // ✅ pembeli
            )
            ->get();

            return response()->json($carts);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
        }
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
            ],
            ['quantity' => $request->quantity]
        );

        return response()->json($cart, 201);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer',
        ]);

        $deleted = Cart::where('user_id', $request->user()->id)
                       ->where('product_id', $request->product_id)
                       ->delete();

        return response()->json(['deleted' => $deleted > 0]);
    }



}

