<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    protected $table = "ruangans";
    protected $fillable = [
        'nama_ruangan',
        'nama_kasi',
    ];

    public function pengukurans()
    {
        return $this->hasMany(Pengukuran::class);
    }

    public function standarts()
    {
        return $this->hasMany(StandartPengukuran::class);
    }
}
