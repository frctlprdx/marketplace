<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function sellerindex(Request $request)
    {
        try {
            $user = $request->user();

            // Cek role seller
            if ($user->role !== 'seller') {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            $transactions = DB::table('transactions')
                ->join('transaction_items', 'transactions.transaction_item', '=', 'transaction_items.id')
                ->join('products', 'transaction_items.product_id', '=', 'products.id')
                ->join('users', 'transactions.user_id', '=', 'users.id')
                ->where('transactions.seller_id', $user->id)
                ->select(
                    'transactions.id as id',
                    'transaction_item',
                    'users.name as user_id', // frontend expects this key
                    'products.name as product_name',
                    'transaction_items.amount as amount',
                    'transactions.status as status',
                    'transactions.created_at as created_at'
                )
                ->orderBy('transactions.created_at', 'desc')
                ->get();

            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDetail($id)
    {
    try {
        $detail = DB::table('transaction_items')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->join('user_shipping_addresses', 'transaction_items.destination', '=', 'user_shipping_addresses.id')
            ->where('transaction_items.id', $id)
            ->select(
                'products.name',
                'products.image',
                'transaction_items.amount',
                'transaction_items.total_price',
                'transaction_items.courier',
                'user_shipping_addresses.label',
                'user_shipping_addresses.recipient_name',
                'user_shipping_addresses.province',
                'user_shipping_addresses.city',
                'user_shipping_addresses.subdistrict'
            )
            ->first();

        if (!$detail) {
            return response()->json(['error' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($detail);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Internal Server Error',
            'message' => $e->getMessage()
        ], 500);
    }
}



    }