<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StandartPengukuran extends Model
{
    protected $table = 'standart_pengukurans';

    protected $fillable = [
        'ruangan_id',
        'kategori_pengukuran_id',
        'min_value',
        'max_value',
        'satuan',
    ];

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriPengukuran::class, 'kategori_pengukuran_id');
    }
}
