<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Snap;
use Midtrans\Config;

class TransactionController extends Controller
{

    public function transactionIndex(Request $request)
    {
        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['error' => 'User ID tidak ditemukan'], 400);
        }

        $transactions = DB::table('transactions')
            ->join('transaction_items', 'transactions.order_id', '=', 'transaction_items.order_id')
            ->join ('products', 'transaction_items.product_id', '=', 'products.id')
            ->where('transactions.user_id', $userId)
            ->orderBy('transactions.created_at', 'desc')
            ->select(
                'transactions.order_id',
                'transaction_items.quantity',
                'transactions.status',
                'transaction_items.total_price',
                'transaction_items.courier',
                'products.name',
                'products.image',
            )
            ->get();

        return response()->json($transactions);
    }
    public function sellerindex(Request $request)
    {
        try {
            $user = $request->user();
            
            // Cek role seller
            if ($user->role !== 'seller') {
                return response()->json(['error' => 'Forbidden'], 403);
            }
            
            $transactions = DB::table('transactions')
                ->join('transaction_items', 'transactions.order_id', '=', 'transaction_items.order_id')
                ->join('products', 'transaction_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->join('users', 'transactions.user_id', '=', 'users.id')
                ->where('transactions.seller_id', $user->id)
                ->select(
                    'transactions.id as id',
                    'transaction_items.id as transaction_item', // Add this field that frontend expects
                    'transaction_items.quantity',
                    'transactions.order_id',
                    'users.name as user_id', // frontend expects this key
                    'products.name as product_name',
                    'categories.name as category_name',
                    'transaction_items.quantity as quantity',
                    'transactions.status as status',
                    'transactions.created_at as created_at'
                )
                ->orderBy('transactions.created_at', 'asc')
                ->get();
            
            return response()->json($transactions);
        } catch (\Exception $e) {
            // Log the actual error for debugging
            
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
                ->join('user_shipping_addresses', 'transaction_items.destination_id', '=', 'user_shipping_addresses.id')
                ->where('transaction_items.id', $id)
                ->select(
                    'products.name',
                    'products.image',
                    'transaction_items.quantity',
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
        // Set Midtrans configuration
        Config::$serverKey = config('Midtrans.server_key');
        Config::$isProduction = config('Midtrans.is_production');
        Config::$isSanitized = config('Midtrans.is_sanitized');
        Config::$is3ds = config('Midtrans.is_3ds');

        // Validation
        $request->validate([
            'totalPrice' => 'required|numeric',
            'recipient_name' => 'required|string',
            'phone' => 'required|string',
            'userID' => 'required|integer',
            'courier' => 'required|string',
            'destination_id' => 'required|integer',
            'item_details' => 'required|array|min:1',
            'customer_details' => 'required|array',
            'products_data' => 'required|array|min:1',
        ]);

        $userID = $request->input('userID');
        $totalPrice = $request->input('totalPrice');
        $recipientName = $request->input('recipient_name');
        $phone = $request->input('phone');
        $itemDetails = $request->input('item_details');
        $customerDetails = $request->input('customer_details');

        // Get user email
        $email = DB::table('users')->where('id', $userID)->value('email');

        // Generate unique order ID
        $orderId = 'ORDER-' . date('YmdHis') . '-' . uniqid() . '-' . $userID;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $totalPrice,
            ],
            'customer_details' => $customerDetails ?: [
                'first_name' => $recipientName,
                'email' => $email ?: 'customer@example.com',
                'phone' => $phone,
            ],
            'item_details' => $itemDetails,
        ];

        try {
            // HANYA generate Snap token, TIDAK menyimpan ke database
            $snapToken = Snap::getSnapToken($params);
            
            return response()->json([
                'token' => $snapToken,
                'order_id' => $orderId,
                'is_cart_checkout' => $request->input('isCartCheckout', false),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Snap Token Creation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function processPayment(Request $request)
{
    // Validation
    $request->validate([
        'order_id' => 'required|string',
        'payment_result' => 'required|array',
        'user_id' => 'required|integer',
        'total_price' => 'required|numeric',
        'recipient_name' => 'required|string',
        'phone' => 'required|string',
        'courier' => 'required|string',
        'destination_id' => 'required|integer',
        'is_cart_checkout' => 'required|boolean',
        'products' => 'required|array|min:1',
        'products.*.product_id' => 'required|integer',
        'products.*.seller_id' => 'required|integer',
        'products.*.quantity' => 'required|integer|min:1',
        'products.*.subtotal' => 'required|numeric',
    ]);

    $orderId = $request->input('order_id');
    $paymentResult = $request->input('payment_result');
    $userId = $request->input('user_id');
    $totalPrice = $request->input('total_price');
    $recipientName = $request->input('recipient_name');
    $phone = $request->input('phone');
    $courier = $request->input('courier');
    $destinationId = $request->input('destination_id');
    $isCartCheckout = $request->input('is_cart_checkout');
    $products = $request->input('products');

    try {
        DB::beginTransaction();

        // Check duplicate order
        $existingTransaction = DB::table('transactions')
            ->where('order_id', $orderId)
            ->first();
        
        if ($existingTransaction) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Order already processed',
            ], 400);
        }

        // Verify products and stock - menggunakan field 'stocks' sesuai schema
        foreach ($products as $product) {
            $productData = DB::table('products')
                ->where('id', $product['product_id'])
                ->first();
            
            if (!$productData) {
                throw new \Exception("Product ID {$product['product_id']} not found");
            }
            
            if ($productData->stocks < $product['quantity']) {
                throw new \Exception("Insufficient stock for {$productData->name}");
            }
        }

        if ($isCartCheckout) {
            // Cart checkout - group by seller
            $productsBySeller = collect($products)->groupBy('seller_id');
            
            foreach ($productsBySeller as $sellerId => $sellerProducts) {
                $sellerTotal = $sellerProducts->sum('subtotal');
                
                // Create transaction per seller - TANPA total_amount, recipient_name, phone, payment_result
                DB::table('transactions')->insert([
                    'order_id' => $orderId . '-SELLER-' . $sellerId,
                    'user_id' => $userId,
                    'seller_id' => $sellerId,
                    'status' => 'paid',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create transaction items and update stocks
                foreach ($sellerProducts as $product) {
                    DB::table('transaction_items')->insert([
                        'order_id' => $orderId . '-SELLER-' . $sellerId,
                        'product_id' => $product['product_id'],
                        'quantity' => $product['quantity'],
                        'total_price' => $product['subtotal'],
                        'courier' => $courier,
                        'destination_id' => $destinationId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    // Update stocks (field name: stocks) dan sold
                    DB::table('products')
                        ->where('id', $product['product_id'])
                        ->decrement('stocks', $product['quantity']);
                    
                    DB::table('products')
                        ->where('id', $product['product_id'])
                        ->increment('sold', $product['quantity']);
                }
            }
            
            // Clear cart
            DB::table('carts')
                ->where('user_id', $userId)
                ->whereIn('product_id', collect($products)->pluck('product_id'))
                ->delete();
                
        } else {
            // Single product checkout
            $product = $products[0];
            
            // Create transaction - TANPA total_amount, recipient_name, phone, payment_result
            $transactionId = DB::table('transactions')->insertGetId([
                'order_id' => $orderId,
                'user_id' => $userId,
                'seller_id' => $product['seller_id'],
                'status' => 'paid',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Create transaction item - TANPA transaction_id
            DB::table('transaction_items')->insert([
                'order_id' => $orderId,
                'product_id' => $product['product_id'],
                'quantity' => $product['quantity'],
                'total_price' => $product['subtotal'],
                'courier' => $courier,
                'destination_id' => $destinationId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Update stocks (field name: stocks) dan sold
            DB::table('products')
                ->where('id', $product['product_id'])
                ->decrement('stocks', $product['quantity']);
            
            DB::table('products')
                ->where('id', $product['product_id'])
                ->increment('sold', $product['quantity']);
        }
        
        DB::commit();
        
        Log::info('Payment Processed Successfully', [
            'order_id' => $orderId,
            'user_id' => $userId,
            'total_amount' => $totalPrice
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully',
            'order_id' => $orderId,
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('Payment Processing Error', [
            'order_id' => $orderId,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Payment processing failed: ' . $e->getMessage(),
        ], 500);
    }
}


}