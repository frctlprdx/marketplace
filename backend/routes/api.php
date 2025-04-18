<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', [ProductController::class, 'index'])->name('products.index'); //Main Page
Route::get('/unauthorized', function () {
    return view('unauthorized'); // Atau redirect ke halaman tertentu
});


Route::middleware('auth:sanctum')->group(function () {
    // Route untuk customer
    Route::get('/cart', [CartController::class, 'index'])->middleware('role:customer')->name('cart.index');

    // Route untuk seller
});

