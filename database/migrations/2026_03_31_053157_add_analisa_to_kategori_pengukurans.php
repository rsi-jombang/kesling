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
        Schema::table('kategori_pengukurans', function (Blueprint $table) {
            $table->text('analisa_memenuhi')->nullable();
            $table->text('analisa_tidak_memenuhi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kategori_pengukurans', function (Blueprint $table) {
            $table->dropColumn(['analisa_memenuhi', 'analisa_tidak_memenuhi']);
        });
    }
};
