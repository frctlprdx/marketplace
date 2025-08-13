<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Notification;

class WebhookTestController extends Controller
{
    /**
     * Test 1: Basic ping test
     * URL: GET /api/test-webhook/ping
     */
    public function ping()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Webhook test endpoint is working!',
            'timestamp' => now(),
            'server_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => app()->environment(),
            ]
        ]);
    }

    /**
     * Test 2: Simulasi data webhook Midtrans dengan static data
     * URL: POST /api/test-webhook/midtrans-simulation
     */
    public function simulateMidtrans(Request $request)
    {
        Log::info('=== WEBHOOK SIMULATION STARTED ===');
        
        try {
            // Static data simulasi dari Midtrans
            $simulationData = [
                'transaction_time' => '2024-08-13 11:15:00',
                'transaction_status' => 'settlement',
                'transaction_id' => 'test-' . time(),
                'status_message' => 'midtrans payment notification',
                'status_code' => '200',
                'signature_key' => 'dummy_signature_' . time(),
                'payment_type' => 'bank_transfer',
                'order_id' => $request->input('order_id', 'TEST-ORDER-' . time()),
                'merchant_id' => 'test_merchant',
                'gross_amount' => '100000.00',
                'fraud_status' => 'accept',
                'currency' => 'IDR'
            ];

            Log::info('Simulation Data', $simulationData);

            $orderId = $simulationData['order_id'];
            $transactionStatus = $simulationData['transaction_status'];
            $fraudStatus = $simulationData['fraud_status'];
            $paymentType = $simulationData['payment_type'];
            $transactionTime = $simulationData['transaction_time'];

            // Cek transaction di database
            $existingTransaction = DB::table('transactions')
                ->where('order_id', $orderId)
                ->first();

            Log::info('Database Check', [
                'order_id' => $orderId,
                'found' => $existingTransaction ? 'YES' : 'NO',
                'current_status' => $existingTransaction->status ?? 'N/A'
            ]);

            // Jika transaction tidak ada, buat dummy transaction dulu
            if (!$existingTransaction) {
                DB::table('transactions')->insert([
                    'order_id' => $orderId,
                    'status' => 'pending',
                    'payment_type' => 'bank_transfer',
                    'amount' => 100000,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Log::info('Created dummy transaction', ['order_id' => $orderId]);
            }

            // Determine status
            $status = match ($transactionStatus) {
                'capture' => $fraudStatus == 'accept' ? 'paid' : 'pending',
                'settlement' => 'paid',
                'pending' => 'pending',
                'deny', 'cancel', 'expire' => 'failed',
                default => 'unknown',
            };

            Log::info('Status Mapping', [
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
                'mapped_status' => $status
            ]);

            // Update database
            $updated = DB::table('transactions')
                ->where('order_id', $orderId)
                ->update([
                    'status' => $status,
                    'payment_type' => $paymentType,
                    'transaction_time' => $transactionTime,
                    'updated_at' => now(),
                ]);

            Log::info('Database Update', [
                'order_id' => $orderId,
                'rows_affected' => $updated,
                'new_status' => $status
            ]);

            // Verify update
            $updatedTransaction = DB::table('transactions')
                ->where('order_id', $orderId)
                ->first();

            Log::info('=== SIMULATION COMPLETED ===', [
                'success' => true,
                'order_id' => $orderId,
                'final_status' => $updatedTransaction->status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Webhook simulation completed',
                'data' => [
                    'order_id' => $orderId,
                    'simulation_data' => $simulationData,
                    'database_update' => [
                        'rows_affected' => $updated,
                        'final_status' => $updatedTransaction->status,
                        'updated_at' => $updatedTransaction->updated_at
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('SIMULATION ERROR', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test 3: Test database update langsung
     * URL: POST /api/test-webhook/test-db-update
     */
    public function testDatabaseUpdate(Request $request)
    {
        try {
            $orderId = $request->input('order_id', 'DB-TEST-' . time());
            
            // Create test transaction
            DB::table('transactions')->insert([
                'order_id' => $orderId,
                'user_id'=>1,
                'seller_id'=>2,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update to paid
            $updated = DB::table('transactions')
                ->where('order_id', $orderId)
                ->update([
                    'status' => 'paid',
                    'updated_at' => now()
                ]);

            // Get final result
            $result = DB::table('transactions')
                ->where('order_id', $orderId)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Database test completed',
                'data' => [
                    'order_id' => $orderId,
                    'rows_updated' => $updated,
                    'final_transaction' => $result
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test 4: Check transaction status
     * URL: GET /api/test-webhook/check-transaction/{orderId}
     */
    public function checkTransaction($orderId)
    {
        try {
            $transaction = DB::table('transactions')
                ->where('order_id', $orderId)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'status' => 'not_found',
                    'message' => 'Transaction not found',
                    'order_id' => $orderId
                ], 404);
            }

            return response()->json([
                'status' => 'found',
                'message' => 'Transaction found',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test 5: Create dummy transaction
     * URL: POST /api/test-webhook/create-dummy-transaction
     */
    public function createDummyTransaction(Request $request)
    {
        try {
            $orderId = $request->input('order_id', 'DUMMY-' . time());
            
            $transaction = [
                'order_id' => $orderId,
                'status' => $request->input('status', 'pending'),
                'user_id'=>1,
                'seller_id'=>2,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            DB::table('transactions')->insert($transaction);

            return response()->json([
                'status' => 'success',
                'message' => 'Dummy transaction created',
                'data' => $transaction
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test 6: Debug webhook dengan logging detail
     * URL: POST /api/test-webhook/midtrans-debug
     * Gunakan URL ini di Midtrans dashboard sebagai pengganti webhook asli
     */
    public function debugWebhook(Request $request)
    {
        Log::info('=== DEBUG WEBHOOK RECEIVED ===', [
            'all_data' => $request->all(),
            'headers' => $request->headers->all(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'raw_content' => $request->getContent()
        ]);

        try {
            // Set Midtrans config
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production', false);
            Config::$isSanitized = config('midtrans.is_sanitized', true);
            Config::$is3ds = config('midtrans.is_3ds', true);

            Log::info('Midtrans Config', [
                'server_key_length' => strlen(config('midtrans.server_key')),
                'is_production' => config('midtrans.is_production'),
                'environment' => config('midtrans.is_production') ? 'production' : 'sandbox'
            ]);

            $notif = new Notification();
            
            Log::info('Notification Data', [
                'order_id' => $notif->order_id ?? 'N/A',
                'transaction_status' => $notif->transaction_status ?? 'N/A',
                'fraud_status' => $notif->fraud_status ?? 'N/A',
                'payment_type' => $notif->payment_type ?? 'N/A',
                'transaction_time' => $notif->transaction_time ?? 'N/A'
            ]);

            // Continue with normal webhook logic...
            $orderId = $notif->order_id;
            $transactionStatus = $notif->transaction_status;
            $fraudStatus = $notif->fraud_status;
            
            $status = match ($transactionStatus) {
                'capture' => $fraudStatus == 'accept' ? 'paid' : 'pending',
                'settlement' => 'paid',
                'pending' => 'pending',
                'deny', 'cancel', 'expire' => 'failed',
                default => 'unknown',
            };

            $updated = DB::table('transactions')
                ->where('order_id', $orderId)
                ->update([
                    'status' => $status,
                    'updated_at' => now(),
                ]);

            Log::info('=== DEBUG WEBHOOK COMPLETED ===', [
                'order_id' => $orderId,
                'status' => $status,
                'rows_updated' => $updated
            ]);

            return response()->json(['message' => 'Debug webhook processed successfully']);

        } catch (\Exception $e) {
            Log::error('DEBUG WEBHOOK ERROR', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json(['message' => 'Debug webhook error: ' . $e->getMessage()], 500);
        }
    }
}