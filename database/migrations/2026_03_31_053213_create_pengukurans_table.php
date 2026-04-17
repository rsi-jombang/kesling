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
        Schema::create('pengukurans', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->foreignId('kategori_pengukuran_id')->constrained('kategori_pengukurans')->cascadeOnDelete();
            $table->foreignId('ruangan_id')->constrained('ruangans')->cascadeOnDelete();
            $table->decimal('value', 10, 2);
            $table->enum('status', ['memenuhi', 'tidak memenuhi'])->nullable();
            $table->enum('waktu_pengukuran', ['pagi', 'siang', 'malam']);
            $table->dateTime('tanggal_pengukuran');
            $table->string('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengukurans');
    }
};
