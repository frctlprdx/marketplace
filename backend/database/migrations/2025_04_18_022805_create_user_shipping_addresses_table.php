<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserShippingAddressesTable extends Migration
{
    public function up(): void
    {
        Schema::create('user_shipping_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('label')->nullable(); // Contoh: "Rumah", "Kantor"
            $table->string('recipient_name');
            $table->string('phone');
            
            $table->string('province');
            $table->string('city');
            $table->string('district');
            $table->string('subdistrict');
            $table->string('zip_code');
            
            $table->text('detail_address'); // alamat lengkap
            $table->boolean('is_default')->default(false); // alamat utama
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_shipping_addresses');
    }
}
