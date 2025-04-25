<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        // Mengambil 7 data secara acak dari tabel 'products'
        $products = DB::table('products')
            ->inRandomOrder()
            ->limit(7) // Membatasi jumlah data yang diambil sebanyak 7
            ->get();

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }
    
}
