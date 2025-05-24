<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function sellerindex(Request $request)
{
    $user = $request->user(); // asumsi pakai sanctum atau auth lain
    $transactions = Transaction::where('seller_id', $user->id)->get();

    return response()->json($transactions);
}
}
