<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            )
            ->where('products.show', 1); // hanya tampilkan yang show = 1

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

        // Random order
        $query->inRandomOrder();

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'stocks' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'image' => 'required|string', // URL dari Supabase
            'product_url' => 'nullable|string|url', // URL produk (opsional)
            'show' => 'required|boolean'
        ]);

        $product = Product::create([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'stocks' => $request->stocks,
            'price' => $request->price,
            'image' => $request->image,
            'product_url' => $request->product_url,
            'show' => $request->show,
            'sold' => 0 // default value untuk field sold
        ]);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $product
        ], 201);
    }

    public function show($id)
    {
        $product = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('users', 'products.user_id', '=', 'users.id')
            ->select(
                'products.*',
                'categories.name as category_name',
                'users.name as seller_name'
            )
            ->where('products.id', $id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function search(Request $request)
    {
        $query = $request->input('search');

        $products = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('users', 'products.user_id', '=', 'users.id')
            ->select(
                'products.*',
                'categories.name as category_name',
                'users.name as seller_name'
            )
            ->where('products.show', 1)
            ->where(function($q) use ($query) {
                $q->where('products.name', 'like', "%{$query}%")
                  ->orWhere('products.description', 'like', "%{$query}%");
            })
            ->get();

        return response()->json($products);
    }

    public function sellerProduct(Request $request)
    {
        $user = $request->user();

        $products = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'products.*',
                'categories.name as category_name'
            )
            ->where('products.user_id', $user->id)
            ->orderBy('products.created_at', 'desc')
            ->get();

        return response()->json($products);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        // Cari produk milik user berdasarkan ID
        $product = Product::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'nullable|string',
            'stocks' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
            'image' => 'sometimes|required|string',
            'product_url' => 'nullable|string|url', // URL produk (opsional)
            'show' => 'sometimes|required|boolean'
        ]);

        // Update hanya field yang diberikan
        $product->update($request->only([
            'name', 
            'category_id', 
            'description', 
            'stocks', 
            'price', 
            'image',
            'product_url', 
            'show'
        ]));

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'data' => $product->fresh()
        ]);
    }

    public function showSeller(Request $request, $id)
    {
        $user = $request->user();

        $product = DB::table('products')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'products.*',
                'categories.name as category_name'
            )
            ->where('products.id', $id)
            ->where('products.user_id', $user->id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $product = Product::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }

    public function addCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name'
        ]);

        $category = Category::create([
            'name' => trim($request->name)
        ]);

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $category
        ], 201);
    }
}