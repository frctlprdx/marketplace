<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Wishlist;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'customer') {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $wishlists = DB::table('wishlists')
                ->join('products', 'wishlists.product_id', '=', 'products.id')
                ->join('users', 'wishlists.user_id', '=', 'users.id')
                ->where('wishlists.user_id', $user->id)
                ->select('wishlists.*', 'products.*', 'users.name as user_name')
                ->get();

            return response()->json($wishlists);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
        }
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $exists = Wishlist::where('user_id', $validated['user_id'])
            ->where('product_id', $validated['product_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already in wishlist'], 200);
        }

        Wishlist::create([
            'user_id' => $validated['user_id'],
            'product_id' => $validated['product_id'],
        ]);

        return response()->json(['message' => 'Added to wishlist'], 201);
    }


    public function destroy(Request $request)
    {
        $userId = $request->input('user_id');
        $productId = $request->input('product_id');

        Wishlist::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Wishlist item deleted']);
    }

    



}
