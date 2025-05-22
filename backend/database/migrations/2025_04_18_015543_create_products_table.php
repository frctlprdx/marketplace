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
            $table->decimal('weight', 8, 0)->default(0); // hapus ->after('price')
            $table->decimal('rating', 2, 1)->default(0.0); // rating rata-rata review
            $table->text('description')->nullable();
            $table->integer('stocks');
            $table->decimal('price', 11, 0);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}
