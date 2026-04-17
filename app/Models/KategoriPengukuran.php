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
        'analisa_memenuhi',
        'analisa_tidak_memenuhi',
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
