<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::all();

        // Kembalikan data produk dalam format JSON
        return response()->json($products);
    }
}
