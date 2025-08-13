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
                    'transactions.order_id',
                    'users.name as user_id', // frontend expects this key
                    'products.name as product_name',
                    'products.stocks',
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
        // Set Midtrans configuration from env
        Config::$serverKey = config('Midtrans.server_key');
        Config::$isProduction = config('Midtrans.is_production');
        Config::$isSanitized = config('Midtrans.is_sanitized');
        Config::$is3ds = config('Midtrans.is_3ds');

        // Check if this is a cart checkout or single product checkout
        $isCartCheckout = $request->input('isCartCheckout', false);

        if ($isCartCheckout) {
            // Validation for cart checkout
            $request->validate([
                'totalPrice' => 'required|numeric',
                'recipient_name' => 'required|string',
                'phone' => 'required|string',
                'userID' => 'required|integer',
                'courier' => 'required|string',
                'destination_id' => 'required|integer',
                'products' => 'required|array|min:1',
                'products.*.product_id' => 'required|integer',
                'products.*.seller_id' => 'required|integer',
                'products.*.quantity' => 'required|integer|min:1',
                'products.*.subtotal' => 'required|numeric',
                // Add validation for item_details
                'item_details' => 'required|array|min:1',
                'customer_details' => 'required|array',
            ]);
        } else {
            // Validation for single product checkout
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
                // Add validation for item_details
                'item_details' => 'required|array|min:1',
                'customer_details' => 'required|array',
            ]);
        }

        $totalPrice = $request->input('totalPrice');
        $recipientName = $request->input('recipient_name');
        $phone = $request->input('phone');
        $userID = $request->input('userID');
        $courier = $request->input('courier');
        $destinationId = $request->input('destination_id');
        
        // *** TAMBAHAN PENTING: Ambil item_details dan customer_details dari frontend ***
        $itemDetails = $request->input('item_details');
        $customerDetails = $request->input('customer_details');

        // Get user email
        $email = DB::table('users')
            ->where('id', $userID)
            ->value('email');

        // Generate unique order ID
        $orderId = 'ORDER-' . date('YmdHis') . '-' . uniqid() . '-' . $userID;

        // *** PERBAIKAN: Gunakan item_details dan customer_details dari frontend ***
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $totalPrice,
            ],
            // Gunakan customer_details dari frontend atau fallback ke data manual
            'customer_details' => $customerDetails ?: [
                'first_name' => $recipientName,
                'last_name' => '',
                'email' => $email ?: 'customer@example.com',
                'phone' => $phone,
            ],
            // *** TAMBAHAN PENTING: Gunakan item_details dari frontend ***
            'item_details' => $itemDetails,
        ];

        // Log untuk debugging
        Log::info('Midtrans Params:', [
            'order_id' => $orderId,
            'gross_amount' => $totalPrice,
            'item_details_count' => count($itemDetails),
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails
        ]);

        try {
            // Get Snap token from Midtrans
            $snapToken = Snap::getSnapToken($params);

            // Start database transaction
            DB::beginTransaction();

            if ($isCartCheckout) {
                // Handle cart checkout - multiple products from same seller
                $products = $request->input('products');
                
                // Since frontend ensures same seller, get seller_id from first product
                $sellerId = $products[0]['seller_id'];
                
                // Verify all products are from same seller (safety check)
                $differentSellers = collect($products)->pluck('seller_id')->unique();
                if ($differentSellers->count() > 1) {
                    DB::rollBack();
                    return response()->json([
                        'error' => 'All products must be from the same seller'
                    ], 400);
                }
                
                // Create transaction record (without total_amount if column doesn't exist)
                $transactionId = DB::table('transactions')->insertGetId([
                    'order_id' => $orderId,
                    'user_id' => $userID,
                    'seller_id' => $sellerId,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create transaction items - one row per item
                foreach ($products as $product) {
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
                }
                
                // Log for debugging
                Log::info('Cart Transaction Created', [
                    'order_id' => $orderId,
                    'user_id' => $userID,
                    'seller_id' => $sellerId,
                    'products_count' => count($products),
                    'total_amount' => $totalPrice
                ]);
                
            } else {
                // Handle single product checkout
                $sellerId = $request->input('seller_id');
                $productId = $request->input('product_id');
                $quantity = $request->input('quantity');
                $subtotal = $request->input('subtotal');
                
                // Create transaction record (without total_amount if column doesn't exist)
                $transactionId = DB::table('transactions')->insertGetId([
                    'order_id' => $orderId,
                    'user_id' => $userID,
                    'seller_id' => $sellerId,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create transaction item record
                DB::table('transaction_items')->insert([
                    'transaction_id' => $transactionId,
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
                Log::info('Single Product Transaction Created', [
                    'order_id' => $orderId,
                    'user_id' => $userID,
                    'seller_id' => $sellerId,
                    'product_id' => $productId,
                    'amount' => $totalPrice
                ]);
            }
            
            // Commit database transaction
            DB::commit();
            
            return response()->json([
                'token' => $snapToken,
                'order_id' => $orderId,
                'is_cart_checkout' => $isCartCheckout,
            ]);
            
        } catch (\Exception $e) {
            // Rollback database transaction on error
            DB::rollBack();
            Log::error('Transaction Creation Error: ' . $e->getMessage());
            Log::error('Request data: ' . json_encode($request->all()));
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function updatePaymentStatus(Request $request)
    {
        try {
            // Log incoming request for debugging
            Log::info('Payment Status Update Request', [
                'request_data' => $request->all()
            ]);

            // Validasi input
            $request->validate([
                'order_id' => 'required|string',
                'payment_status' => 'required|string|in:paid',
                'products' => 'required|array|min:1',
                'products.*.product_id' => 'required|integer',
                'products.*.quantity' => 'required|integer|min:1',
            ]);

            $orderId = $request->input('order_id');
            $paymentStatus = $request->input('payment_status');
            $products = $request->input('products');
            $paymentResult = $request->input('payment_result');

            // Check if transaction exists
            $transaction = DB::table('transactions')
                ->where('order_id', $orderId)
                ->first();

            if (!$transaction) {
                Log::error('Transaction not found', ['order_id' => $orderId]);
                return response()->json([
                    'error' => 'Transaction not found',
                    'order_id' => $orderId
                ], 404);
            }

            Log::info('Transaction found', [
                'transaction_id' => $transaction->id,
                'current_status' => $transaction->status
            ]);

            // Start database transaction
            DB::beginTransaction();

            // 1. Update transaction status
            $transactionUpdated = DB::table('transactions')
                ->where('order_id', $orderId)
                ->update([
                    'status' => $paymentStatus,
                    'payment_result' => $paymentResult ? json_encode($paymentResult) : null,
                    'updated_at' => now(),
                ]);

            if (!$transactionUpdated) {
                DB::rollBack();
                Log::error('Failed to update transaction', ['order_id' => $orderId]);
                return response()->json([
                    'error' => 'Failed to update transaction status'
                ], 400);
            }

            Log::info('Transaction status updated', [
                'order_id' => $orderId,
                'new_status' => $paymentStatus
            ]);

            // 2. Update product stocks and sold count
            foreach ($products as $productData) {
                $productId = $productData['product_id'];
                $quantityPurchased = $productData['quantity'];

                Log::info('Processing product update', [
                    'product_id' => $productId,
                    'quantity' => $quantityPurchased
                ]);

                // Get current product data
                $product = DB::table('products')
                    ->where('id', $productId)
                    ->first();

                if (!$product) {
                    DB::rollBack();
                    Log::error('Product not found', ['product_id' => $productId]);
                    return response()->json([
                        'error' => "Product with ID {$productId} not found"
                    ], 404);
                }

                Log::info('Current product data', [
                    'product_id' => $productId,
                    'current_stock' => $product->stocks,
                    'current_sold' => $product->sold ?? 0
                ]);

                // Check if sufficient stock
                if ($product->stocks < $quantityPurchased) {
                    DB::rollBack();
                    Log::error('Insufficient stock', [
                        'product_id' => $productId,
                        'available' => $product->stocks,
                        'required' => $quantityPurchased
                    ]);
                    return response()->json([
                        'error' => "Insufficient stock for product ID {$productId}. Available: {$product->stocks}, Required: {$quantityPurchased}"
                    ], 400);
                }

                // Update product stocks and sold count
                $newStock = $product->stocks - $quantityPurchased;
                $newSold = ($product->sold ?? 0) + $quantityPurchased;

                $productUpdated = DB::table('products')
                    ->where('id', $productId)
                    ->update([
                        'stocks' => $newStock,
                        'sold' => $newSold,
                        'updated_at' => now(),
                    ]);

                if (!$productUpdated) {
                    DB::rollBack();
                    Log::error('Failed to update product', ['product_id' => $productId]);
                    return response()->json([
                        'error' => "Failed to update product ID {$productId}"
                    ], 400);
                }

                Log::info("Product updated successfully", [
                    'product_id' => $productId,
                    'quantity_purchased' => $quantityPurchased,
                    'old_stock' => $product->stocks,
                    'new_stock' => $newStock,
                    'old_sold' => $product->sold ?? 0,
                    'new_sold' => $newSold
                ]);
            }

            // Commit transaction
            DB::commit();

            // Log successful payment update
            Log::info('Payment Status Updated Successfully', [
                'order_id' => $orderId,
                'status' => $paymentStatus,
                'products_count' => count($products)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment status and product stocks updated successfully',
                'order_id' => $orderId,
                'status' => $paymentStatus,
                'updated_products' => count($products)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment Status Update Error: ' . $e->getMessage(), [
                'order_id' => $request->input('order_id'),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Internal Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


}