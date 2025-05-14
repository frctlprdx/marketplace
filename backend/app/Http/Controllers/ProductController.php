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
    $query = Product::query();

    // Filter by search keyword
    if ($request->filled('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
    }

    // Filter by category
    if ($request->filled('category')) {
        $query->where('category_id', $request->category);
    }

    // Filter by minimum price
    if ($request->filled('minPrice')) {
    $query->where('price', '>=', intval($request->minPrice));
    }

    if ($request->filled('maxPrice')) {
        $query->where('price', '<=', intval($request->maxPrice));
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

    public function searchByFilter(Request $request)
    {
        $categoryId = $request->input('category_id');
        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');
        
        // Debug log
        Log::info('Category ID: ' . $categoryId);
        Log::info('Min Price: ' . $minPrice);
        Log::info('Max Price: ' . $maxPrice);

        $query = Product::query();

        // Filter berdasarkan kategori
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        // Filter berdasarkan harga minimal
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }

        // Filter berdasarkan harga maksimal
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }

        $products = $query->get();

        return response()->json($products);
    }

    
}
