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

Route::get('/products', [ProductController::class, 'index'])->name('products.index'); //Main Page //Check
Route::get('/products/{id}', [ProductController::class, 'show']); //Check
Route::post('/register', [UserController::class, 'register']); //Check
Route::post('/login', [UserController::class, 'login']); //Check
Route::get('/product', [ProductController::class, 'search'])->name('product.search');


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', [UserController::class, 'indexuser'])->name('profile.index'); //Check
    Route::put('/profile/{id}', [UserController::class, 'update'])->name('profile.update');//Check

    // Route untuk seller)
    Route::get('/allusers', [UserController::class, 'indexall'])->middleware('role:seller')->name('users.index');
    Route::post('/user', [UserController::class, 'store'])->middleware('role:seller')->name('user.store');
    Route::put('/user/{id}', [UserController::class, 'update'])->middleware('role:seller')->name('user.update');
    Route::delete('/user/{id}', [UserController::class, 'destroy'])->middleware('role:seller')->name('user.destroy');

    Route::get('/sellerpage', [ProductController::class, 'sellerProduct'])->middleware('role:seller')->name('seller.page'); //Check
    Route::post('/product', [ProductController::class, 'store'])->middleware('role:seller')->name('product.store');//Check
    Route::get('/product/{id}', [ProductController::class, 'showSeller'])->middleware('role:seller')->name('product.store');//Check
    Route::put('/product/{id}', [ProductController::class, 'update'])->middleware('role:seller')->name('product.update'); // Check
});