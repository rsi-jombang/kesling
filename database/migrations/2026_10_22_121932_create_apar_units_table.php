<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apar_units', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->foreignId('ruangan_id')->constrained('ruangans')->cascadeOnDelete();
            $table->string('nomor_seri')->unique();
            $table->string('jenis')->nullable();
            $table->string('kapasitas')->nullable();
            $table->date('tanggal_kadaluarsa')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apar_units');
    }
};