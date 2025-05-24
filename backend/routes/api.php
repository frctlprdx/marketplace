<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RajaOngkirController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\UserAddressController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index'])->name('products.index'); //Main Page //Check
Route::get('/products/{id}', [ProductController::class, 'show']); //Check
Route::post('/register', [UserController::class, 'register']); //Check
Route::post('/login', [UserController::class, 'login']); //Check
Route::get('/product', [ProductController::class, 'search'])->name('product.search');
Route::get('/categories', function () {
    return App\Models\Category::all(); // Mengambil semua kategori
}); //Check

Route::get('/destination', [RajaOngkirController::class, 'searchDestination'])->name('destination.search');
Route::post('/countprice', [RajaOngkirController::class, 'countPrice'])->name('countPrice');

Route::middleware('auth:sanctum')->group(function () {
    // Route untuk customer
    Route::get('/cart', [CartController::class, 'index'])->middleware('role:customer')->name('cart.index'); //Check
    Route::post('/cart', [CartController::class, 'store'])->middleware('role:customer')->name('cart.store'); //Check
    Route::delete('/cart', [CartController::class, 'destroy'])->middleware('role:customer')->name('cart.destroy'); //Check

    Route::get('/wishlist', [WishlistController::class, 'index'])->middleware('role:customer')->name('wishlist.index'); //Check
    Route::post('/wishlist', [WishlistController::class, 'store'])->middleware('role:customer')->name('wishlist.store'); //Check
    Route::delete('/wishlist', [WishlistController::class, 'destroy'])->middleware('role:customer')->name('wishlist.destroy'); //Check

    Route::get('/profile', [UserController::class, 'indexuser'])->middleware('role:customer')->name('profile.index');
    Route::put('/profile/{id}', [UserController::class, 'update'])->middleware('role:customer')->name('profile.update');

    // Route alamat user (customer)
    Route::get('/addresses', [UserAddressController::class, 'index'])->middleware('role:customer')->name('addresses.index'); //Check
    Route::post('/addresses', [UserAddressController::class, 'store'])->middleware('role:customer')->name('addresses.store'); //Check
    Route::delete('/addresses/{id}', [UserAddressController::class, 'destroy'])->middleware('role:customer')->name('addresses.delete'); //Check
    Route::put('/addresses/{id}', [UserAddressController::class, 'update'])->middleware('role:customer')->name('addresses.update'); //Check

    Route::get('/transactionhistory', [TransactionController::class, 'historyindex'])->middleware('role:customer')->name('transaction.index');
    Route::post('/transactionhistory', [TransactionController::class, 'store'])->middleware('role:customer')->name('transaction.store');
    Route::put('/transactionhistory/{id}', [TransactionController::class, 'update'])->middleware('role:customer')->name('transaction.update');
    Route::delete('/transactionhistory/{id}', [TransactionController::class, 'destroy'])->middleware('role:customer')->name('transaction.destroy');

    Route::get('/transactionitem/{id}', [TransactionController::class, 'itemindex'])->middleware('role:customer')->name('transaction.item');

    // Route untuk seller)
    Route::get('/allusers', [UserController::class, 'indexall'])->middleware('role:seller')->name('users.index');
    Route::post('/user', [UserController::class, 'store'])->middleware('role:seller')->name('user.store');
    Route::put('/user/{id}', [UserController::class, 'update'])->middleware('role:seller')->name('user.update');
    Route::delete('/user/{id}', [UserController::class, 'destroy'])->middleware('role:seller')->name('user.destroy');

    Route::get('/sellerpage', [ProductController::class, 'sellerProduct'])->middleware('role:seller')->name('seller.page'); //Check
    Route::post('/product', [ProductController::class, 'store'])->middleware('role:seller')->name('product.store');//Check
    Route::get('/product/{id}', [ProductController::class, 'showSeller'])->middleware('role:seller')->name('product.store');//Check
    Route::put('/product/{id}', [ProductController::class, 'update'])->middleware('role:seller')->name('product.update'); // Check

    Route::get('/payments', [PaymentController::class, 'index'])->middleware('role:seller')->name('payments.index');

    Route::get('/sellertransactionpage', [TransactionController::class, 'sellerindex'])->middleware('role:seller')->name('seller.transaction.index'); //Check
    Route::get('/transactiondetail/{id}', [TransactionController::class, 'getDetail'])->middleware('role:seller')->name('seller.transaction.detail'); //Check
});

