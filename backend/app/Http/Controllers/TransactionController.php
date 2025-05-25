<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Snap;
use Midtrans\Config;

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
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->join('users', 'transactions.user_id', '=', 'users.id')
                ->where('transactions.seller_id', $user->id)
                ->select(
                    'transactions.id as id',
                    'transaction_item',
                    'users.name as user_id', // frontend expects this key
                    'products.name as product_name',
                    'categories.name as category_name',
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

    public function getSnapToken(Request $request)
    {
        // Set Midtrans configuration from env
        Config::$serverKey = config('Midtrans.server_key');
        Config::$isProduction = config('Midtrans.is_production');
        Config::$isSanitized = config('Midtrans.is_sanitized');
        Config::$is3ds = config('Midtrans.is_3ds');

        $request->validate([
            'totalPrice' => 'required|numeric',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'userID' => 'required|integer',
            'seller_id' => 'required|integer',
            'product_id' => 'required|integer',
            'quantity' => 'required|integer',
            'subtotal' => 'required|numeric',
            'courier' => 'required|string',
            'destination_id' => 'required|integer',
        ]);

        $totalPrice = $request->input('totalPrice');
        $recipientName = $request->input('recipient_name');
        $phone = $request->input('phone');
        $userID = $request->input('userID');
        $sellerId = $request->input('seller_id');
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');
        $subtotal = $request->input('subtotal');
        $courier = $request->input('courier');
        $destinationId = $request->input('destination_id');

        $email = DB::table('users')
            ->where('id', $userID)
            ->value('email');

        // Generate unique order ID
        $orderId = 'ORDER-' . date('YmdHis') . '-' . uniqid() . '-' . $userID;
        
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $totalPrice,
            ],
            'customer_details' => [
                'first_name' => $recipientName,
                'last_name' => '',
                'email' => $email ?: 'customer@example.com',
                'phone' => $phone,
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            
            // Create transaction record
            DB::table('transactions')->insert([
                'order_id' => $orderId,
                'user_id' => $userID,
                'seller_id' => $sellerId,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create transaction item record
            DB::table('transaction_items')->insert([
                'order_id' => $orderId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'total_price' => $subtotal,
                'courier' => $courier,
                'destination_id' => $destinationId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Log for debugging
            Log::info('Transaction Created', [
                'order_id' => $orderId,
                'user_id' => $userID,
                'seller_id' => $sellerId,
                'product_id' => $productId,
                'amount' => $totalPrice
            ]);

            return response()->json([
                'token' => $snapToken,
                'order_id' => $orderId,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Transaction Creation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    }