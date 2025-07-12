<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('products')
            ->join('users', 'products.user_id', '=', 'users.id')
            ->select(
                'products.*',
                'users.name as seller_name'
            )
            ->where('products.show', 1); // hanya tampilkan yang show = 
        $query->inRandomOrder();

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'required|string', // URL dari Supabase
            'linkshopping' => 'required|string',
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $product
        ]);
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

    public function sellerProduct(Request $request)
    {
        $user = $request->user(); // user dari token yang dikirim

        $products = Product::where('user_id', $user->id)
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

        // Update data produk termasuk gambar baru (kalau ada)
        $product->update($request->only(['name', 'price', 'image', 'show', 'linkshopping']));

        return response()->json(['message' => 'Produk berhasil diperbarui']);
    }


    public function showSeller(Request $request, $id)
    {
        $user = $request->user();

        $product = Product::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }
}
