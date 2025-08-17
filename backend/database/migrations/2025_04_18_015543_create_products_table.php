<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // penjual
            $table->string('name');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->integer('sold')->default(0); // jumlah terjual
            $table->text('description')->nullable();
            $table->integer('stocks');
            $table->decimal('price', 11, 0);
            $table->string('image')->nullable();
            $table->string('product_url')->nullable();
            $table->boolean('show')->default(true); // ✅ tambahkan ini
            $table->timestamps();
        });
    }


    public function down()
    {
        Schema::dropIfExists('products');
    }
}
