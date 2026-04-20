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
            $table->boolean('is_public')->default(false)->after('tipe_data');
            $table->text('analisa_melebihi_standart')->nullable()->after('analisa_tidak_memenuhi');
            $table->boolean('is_input_2_times')->default(false)->after('analisa_melebihi_standart')->comment('input 2 kali dalam satu shift');
        });

        Schema::table('ruangans', function (Blueprint $table) {
            $table->string('nama_kasi')->nullable()->after('nama_ruangan');
            $table->decimal('panjang', 8, 2)->default(0)->after('nama_kasi');
            $table->decimal('lebar', 8, 2)->default(0)->after('panjang');
            $table->decimal('tinggi', 8, 2)->default(0)->after('lebar');
            $table->decimal('luas_ventilasi_statis', 8, 4)->default(0)->after('tinggi');
        });

        Schema::table('pengukurans', function (Blueprint $table) {
            // Making value nullable since APAR might not have a primary numeric value
            $table->decimal('value', 10, 2)->nullable()->change();
            // Adding JSON column to store checklist status or complex calculations
            $table->text('detail_pengukuran')->nullable()->after('value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kategori_pengukurans', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'is_input_2_times', 'analisa_melebihi_standart']);
        });

        Schema::table('ruangans', function (Blueprint $table) {
            $table->dropColumn(['nama_kasi', 'panjang', 'lebar', 'tinggi', 'luas_ventilasi_statis']);
        });

        Schema::table('pengukurans', function (Blueprint $table) {
            $table->dropColumn('detail_pengukuran');
            // Reverting to not null is tricky without data loss, we just leave it nullable or force change back
            $table->decimal('value', 10, 2)->nullable(false)->change();
        });
    }
};
