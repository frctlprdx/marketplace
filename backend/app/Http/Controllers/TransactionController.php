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
            ]);
        }

        $totalPrice = $request->input('totalPrice');
        $recipientName = $request->input('recipient_name');
        $phone = $request->input('phone');
        $userID = $request->input('userID');
        $courier = $request->input('courier');
        $destinationId = $request->input('destination_id');

        // Get user email
        $email = DB::table('users')
            ->where('id', $userID)
            ->value('email');

        // Generate unique order ID
        $orderId = 'ORDER-' . date('YmdHis') . '-' . uniqid() . '-' . $userID;

        // Prepare Midtrans parameters
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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function handleNotification(Request $request)
    {
        try {
            // Ambil data dari request body
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Log::error('Midtrans Notification: Invalid JSON input');
                return response()->json(['error' => 'Invalid input'], 400);
            }

            $transaction_status = $input['transaction_status'] ?? null;
            $order_id = $input['order_id'] ?? null;
            $gross_amount = $input['gross_amount'] ?? null;
            $fraud_status = $input['fraud_status'] ?? null;
            $transaction_time = $input['transaction_time'] ?? null;
            $payment_type = $input['payment_type'] ?? null;

            Log::info('Midtrans Notification Received', [
                'transaction_status' => $transaction_status,
                'order_id' => $order_id,
                'gross_amount' => $gross_amount,
                'fraud_status' => $fraud_status,
                'payment_type' => $payment_type,
                'transaction_time' => $transaction_time,
            ]);

            if (!$order_id || !$transaction_status) {
                Log::error('Midtrans Notification: Missing required fields');
                return response()->json(['error' => 'Missing required fields'], 400);
            }

            // Update status transaksi berdasarkan status dari Midtrans
            $status = $this->getMappedStatus($transaction_status, $fraud_status);
            
            $updated = DB::table('transactions')->where('order_id', $order_id)->update([
                'status' => $status,
                'payment_type' => $payment_type,
                'transaction_time' => $transaction_time ? date('Y-m-d H:i:s', strtotime($transaction_time)) : now(),
                'updated_at' => now(),
            ]);

            if ($updated === 0) {
                Log::warning('Midtrans Notification: Transaction not found', ['order_id' => $order_id]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            Log::info('Transaction status updated', [
                'order_id' => $order_id,
                'new_status' => $status
            ]);

            // Jika pembayaran berhasil, update stok produk
            if ($this->isSuccessfulPayment($transaction_status, $fraud_status)) {
                $this->updateProductStock($order_id);
            }

            // Jika pembayaran gagal atau dibatalkan, kembalikan stok (jika diperlukan)
            if ($this->isFailedPayment($transaction_status)) {
                $this->restoreProductStock($order_id);
            }

            return response()->json(['message' => 'Notification processed successfully'], 200);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Map Midtrans status ke status aplikasi
     */
    private function getMappedStatus($transaction_status, $fraud_status = null)
    {
        switch ($transaction_status) {
            case 'capture':
                return ($fraud_status == 'accept') ? 'paid' : 'pending';
            case 'settlement':
                return 'paid';
            case 'pending':
                return 'pending';
            case 'deny':
            case 'cancel':
            case 'expire':
                return 'failed';
            case 'refund':
            case 'partial_refund':
                return 'refunded';
            default:
                return 'unknown';
        }
    }

    /**
     * Cek apakah pembayaran berhasil
     */
    private function isSuccessfulPayment($transaction_status, $fraud_status = null)
    {
        return ($transaction_status === 'settlement') || 
            ($transaction_status === 'capture' && $fraud_status === 'accept');
    }

    /**
     * Cek apakah pembayaran gagal
     */
    private function isFailedPayment($transaction_status)
    {
        return in_array($transaction_status, ['deny', 'cancel', 'expire']);
    }

    /**
     * Update stok produk setelah pembayaran berhasil
     */
    private function updateProductStock($order_id)
    {
        try {
            $transaction_items = DB::table('transaction_items')
                ->where('order_id', $order_id)
                ->get();

            foreach ($transaction_items as $item) {
                $updated = DB::table('products')
                    ->where('id', $item->product_id)
                    ->where('stocks', '>=', $item->quantity) // Pastikan stok cukup
                    ->update([
                        'sold' => DB::raw('sold + ' . $item->quantity),
                        'stocks' => DB::raw('stocks - ' . $item->quantity),
                        'updated_at' => now(),
                    ]);

                if ($updated > 0) {
                    Log::info('Product stock updated', [
                        'product_id' => $item->product_id,
                        'quantity_sold' => $item->quantity,
                        'order_id' => $order_id
                    ]);
                } else {
                    Log::warning('Failed to update product stock - insufficient stock or product not found', [
                        'product_id' => $item->product_id,
                        'quantity_requested' => $item->quantity,
                        'order_id' => $order_id
                    ]);
                }
            }

            // Hapus item dari cart jika checkout dari cart
            $transaction = DB::table('transactions')->where('order_id', $order_id)->first();
            if ($transaction && $transaction->user_id) {
                $product_ids = $transaction_items->pluck('product_id')->toArray();
                
                $deleted = DB::table('carts')
                    ->where('user_id', $transaction->user_id)
                    ->whereIn('product_id', $product_ids)
                    ->delete();

                if ($deleted > 0) {
                    Log::info('Cart items cleared after successful payment', [
                        'user_id' => $transaction->user_id,
                        'products_removed' => $product_ids,
                        'order_id' => $order_id
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Error updating product stock', [
                'order_id' => $order_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Kembalikan stok produk jika pembayaran gagal (opsional)
     */
    private function restoreProductStock($order_id)
    {
        try {
            // Implementasi ini opsional - hanya jika Anda mengurangi stok saat order dibuat
            // Biasanya stok baru dikurangi setelah pembayaran berhasil
            
            Log::info('Payment failed - stock restoration may be needed', [
                'order_id' => $order_id
            ]);

        } catch (\Exception $e) {
            Log::error('Error restoring product stock', [
                'order_id' => $order_id,
                'error' => $e->getMessage()
            ]);
        }
    }

        public function itemindex(Request $request, $id)
        {
            try {
                $items = DB::table('transaction_items')
                    ->join('products', 'transaction_items.product_id', '=', 'products.id')
                    ->where('transaction_items.order_id', $id)
                    ->select(
                        'products.name',
                        'products.image',
                        'transaction_items.quantity',
                        'transaction_items.total_price',
                        'transaction_items.courier'
                    )
                    ->get();

                if ($items->isEmpty()) {
                    return response()->json(['message' => 'No items found for this transaction'], 404);
                }

                return response()->json($items);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Internal Server Error', 'message' => $e->getMessage()], 500);
            }
        }

}