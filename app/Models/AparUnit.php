<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AparUnit extends Model
{
    protected $fillable = [
        'slug',
        'ruangan_id',
        'nomor_seri',
        'jenis',
        'kapasitas',
        'tanggal_kadaluarsa',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_kadaluarsa' => 'date',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $unit) {
            if (empty($unit->slug)) {
                $unit->slug = (string) Str::uuid();
            }
        });
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }
}