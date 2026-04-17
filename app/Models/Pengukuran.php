<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengukuran extends Model
{
    protected $fillable = [
        'slug',
        'kategori_pengukuran_id',
        'ruangan_id',
        'value',
        'status',
        'waktu_pengukuran',
        'tanggal_pengukuran',
        'keterangan',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $pengukuran) {
            $standart = StandartPengukuran::where('ruangan_id', $pengukuran->ruangan_id)
                ->where('kategori_pengukuran_id', $pengukuran->kategori_pengukuran_id)
                ->first();

            if (! $standart) {
                $pengukuran->status = 'tidak memenuhi';
                return;
            }

            $value = (float) $pengukuran->value;
            $v1    = $standart->min_value !== null ? (float) $standart->min_value : null;
            $v2    = $standart->max_value !== null ? (float) $standart->max_value : null;

            // Normalisasi: Ambil ambang batas bawah (min) dan atas (max) yang sebenarnya
            $min = ($v1 !== null && $v2 !== null) ? min($v1, $v2) : ($v1 ?? null);
            $max = ($v1 !== null && $v2 !== null) ? max($v1, $v2) : ($v2 ?? null);

            // Jika hanya salah satu yang diisi, pastikan variabel terisi dengan benar
            if ($v1 !== null && $v2 === null) { $min = $v1; $max = null; }
            if ($v2 !== null && $v1 === null) { $min = null; $max = $v2; }

            $memenuhi = ($min === null || $value >= $min)
                     && ($max === null || $value <= $max);

            $pengukuran->status = $memenuhi ? 'memenuhi' : 'tidak memenuhi';
        });
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriPengukuran::class, 'kategori_pengukuran_id');
    }

    public function kategori_pengukuran()
    {
        return $this->belongsTo(KategoriPengukuran::class, 'kategori_pengukuran_id');
    }

    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'memenuhi'       => '<span class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Memenuhi</span>',
            'tidak memenuhi' => '<span class="inline-flex items-center rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">Tidak Memenuhi</span>',
            default          => '<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Tidak Diketahui</span>',
        };
    }

    public function getWaktuPengukuranBadgeAttribute()
    {
        return match($this->waktu_pengukuran) {
            'pagi'   => '<span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">Pagi</span>',
            'siang'  => '<span class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">Siang</span>',
            'malam'  => '<span class="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">Malam</span>',
            default  => '<span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Tidak Diketahui</span>',
        };
    }
}
