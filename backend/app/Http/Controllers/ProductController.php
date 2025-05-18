<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('users', 'products.user_id', '=', 'users.id')
            ->select(
                'products.*',
                'categories.name as category_name',
                'users.name as seller_name'
            );

        // Filter by search keyword
        if ($request->filled('search')) {
            $query->where('products.name', 'like', '%' . $request->search . '%');
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('products.category_id', $request->category);
        }

        // Filter by minimum price
        if ($request->filled('minPrice')) {
            $query->where('products.price', '>=', intval($request->minPrice));
        }

        // Filter by maximum price
        if ($request->filled('maxPrice')) {
            $query->where('products.price', '<=', intval($request->maxPrice));
        }

        return response()->json($query->get());
    }



    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function search(Request $request)
    {
        // Ambil kata kunci dari input pencarian
        $query = $request->input('search');

        // Cari produk berdasarkan kata kunci, bisa menggunakan pencarian partial atau exact match
        $products = Product::where('name', 'like', "%{$query}%")
                           ->orWhere('description', 'like', "%{$query}%")
                           ->get();

        // Kembalikan view atau data produk (bisa diubah sesuai kebutuhan)
        return view('product.index', ['products' => $products]);
    }  

    
}
