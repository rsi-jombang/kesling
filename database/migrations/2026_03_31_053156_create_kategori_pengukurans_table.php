<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kategori_pengukurans', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->string('nama_kategori');
            $table->string('satuan')->nullable();
            $table->string('tipe_data')->default('numeric');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_pengukurans');
    }
};
