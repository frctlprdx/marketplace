<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProductController::class, 'index'])->name('products.index'); //Main Page
Route::get('/unauthorized', function () {
    return view('unauthorized'); // Atau redirect ke halaman tertentu
});

Route::middleware('auth:sanctum')->group(function () {
    // Route untuk customer
    Route::get('/cart', [CartController::class, 'index'])->middleware('role:customer')->name('cart.index');
    // Route::get('/wishlist', [WishlistController::class, 'index'])->middleware('role:customer')->name('wishlist.index');
    // Route::get('/profile', [ProfileController::class, 'index'])->middleware('role:customer')->name('profile.index');
    Route::get('/transactionhistory', [TransactionController::class, 'historyindex'])->middleware('role:customer')->name('transaction.index');
    Route::get('/transactionitem/{id}', [TransactionController::class, 'itemindex'])->middleware('role:customer')->name('transaction.item');

    // Route untuk seller)
    Route::get('/sellerpage', function () {
        return view('sellerpage');
    })->middleware('role:seller')->name('seller.page');
    Route::get('/payments', [PaymentController::class, 'index'])->middleware('role:seller')->name('payments.index');
    Route::get('/sellertransactionpage', [TransactionController::class, 'sellerindex'])->middleware('role:seller')->name('seller.transaction.index');
    Route::get('/sellertransactionitempage/{id}', [TransactionController::class, 'sellertransactionitem'])->middleware('role:seller')->name('seller.transaction.item');
});

