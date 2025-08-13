<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RajaOngkirController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\UserAddressController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::get('/product', [ProductController::class, 'search'])->name('product.search');
Route::get('/categories', function () { return App\Models\Category::all();});

// Raja Ongkir Routes
Route::get('/destination', [RajaOngkirController::class, 'searchDestination'])->name('destination.search');
Route::post('/countprice', [RajaOngkirController::class, 'countPrice'])->name('countPrice');

Route::put('/transaction/update-payment', [TransactionController::class, 'updatePaymentStatus']);


// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Customer Routes
    Route::middleware('role:customer')->group(function () {
        // Cart Management
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
        Route::delete('/cart', [CartController::class, 'destroy'])->name('cart.destroy');

        // Wishlist Management  
        Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
        Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
        Route::delete('/wishlist', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

        // Address Management
        Route::get('/addresses', [UserAddressController::class, 'index'])->name('addresses.index');
        Route::post('/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{id}', [UserAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{id}', [UserAddressController::class, 'destroy'])->name('addresses.delete');

        // Transaction Management
        Route::post('/snaptoken', [TransactionController::class, 'getSnapToken'])->name('transaction.store');
        Route::get('/transactionhistory', [TransactionController::class, 'transactionIndex'])->name('transaction.index');
        Route::get('/transactionitem/{id}', [TransactionController::class, 'itemindex'])->name('transaction.item');
    });

    // Profile Routes (Both customer & seller)
    Route::get('/profile', [UserController::class, 'indexuser'])->name('profile.index');
    Route::put('/profile/{id}', [UserController::class, 'update'])->name('profile.update');

    // Seller Routes
    Route::middleware('role:seller')->group(function () {
        // User Management (Admin functions)
        Route::get('/allusers', [UserController::class, 'indexall'])->name('users.index');
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        Route::put('/user/{id}', [UserController::class, 'update'])->name('user.update');
        Route::delete('/user/{id}', [UserController::class, 'destroy'])->name('user.destroy');

        // Product Management
        Route::get('/sellerpage', [ProductController::class, 'sellerProduct'])->name('seller.page');
        Route::post('/product', [ProductController::class, 'store'])->name('product.store');
        Route::get('/product/{id}', [ProductController::class, 'showSeller'])->name('product.show');
        Route::put('/product/{id}', [ProductController::class, 'update'])->name('product.update');

        // Payment & Transaction Management
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/sellertransactionpage', [TransactionController::class, 'sellerindex'])->name('seller.transaction.index');
        Route::get('/transactiondetail/{id}', [TransactionController::class, 'getDetail'])->name('seller.transaction.detail');
    });
});