<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriPengukuran extends Model
{
    protected $fillable = [
        'slug',
        'nama_kategori',
        'satuan',
        'tipe_data',
        'keterangan',
        'is_public',
        'analisa_memenuhi',
        'analisa_tidak_memenuhi',
        'analisa_melebihi_standart',
        'is_input_2_times',
    ];

    public function pengukurans()
    {
        return $this->hasMany(Pengukuran::class);
    }

    public function standarts()
    {
        return $this->hasMany(StandartPengukuran::class, 'kategori_pengukuran_id');
    }
}
