<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\KategoriPengukuran;
use App\Models\Pengukuran;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PublicPengukuranController extends Controller
{
    public function index()
    {
        $ruangans = Ruangan::with(['standarts' => function($query) {
            $query->whereHas('kategori', function($q) {
                $q->where('is_public', true);
            })->with('kategori');
        }])->orderBy('nama_ruangan')->get();

        // Hanya ambil kategori yang diizinkan untuk publik (untuk report/chart filter)
        $kategoris = KategoriPengukuran::where('is_public', true)->orderBy('nama_kategori')->get(['id', 'nama_kategori', 'satuan']);

        return Inertia::render('welcome', [
            'ruangans' => $ruangans,
            'kategoris' => $kategoris,
            'dateDefaults' => [
                'bulan' => now()->month,
                'tahun' => now()->year,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangans,id',
            'tanggal_pengukuran' => 'required|date',
            'waktu_pengukuran' => 'required|in:pagi,siang,malam',
            'measurements' => 'required|array',
            'measurements.*' => 'nullable', // tidak strict numeric karena ada tipe data lain
        ]);

        // Cek apakah data untuk ruangan, shift, dan tanggal ini sudah ada
        $date = date('Y-m-d', strtotime($request->tanggal_pengukuran));
        $exists = Pengukuran::where('ruangan_id', $request->ruangan_id)
            ->where('waktu_pengukuran', $request->waktu_pengukuran)
            ->whereDate('tanggal_pengukuran', $date)
            ->exists();

        if ($exists) {
            $ruangan = Ruangan::find($request->ruangan_id);
            return back()->withErrors([
                'ruangan_id' => "Data pengukuran untuk {$ruangan->nama_ruangan} pada shift {$request->waktu_pengukuran} sudah diinput hari ini."
            ]);
        }

        foreach ($request->measurements as $kategoriId => $value) {
            if ($value === null || $value === '') continue;

            $kategori = KategoriPengukuran::find($kategoriId);
            $realValue = $value;
            $detailData = null;

            if ($kategori && $kategori->tipe_data === 'checklist_apar') {
                $realValue = null;
                $detailData = is_array($value) ? json_encode($value) : $value;
            } elseif ($kategori && $kategori->tipe_data === 'rumus_ach') {
                $ruang = Ruangan::find($request->ruangan_id);
                $volume = $ruang->panjang * $ruang->lebar * $ruang->tinggi;
                $luas_ventilasi = $ruang->luas_ventilasi_statis + (float)$value;
                $laju_ventilasi = $luas_ventilasi * 60;
                $pertukaran = $laju_ventilasi + (float)$value;
                $ach = $volume > 0 ? $pertukaran / $volume : 0;

                $realValue = round($ach, 2);
                $detailData = json_encode([
                    'input_laju_udara' => $value,
                    'volume' => $volume,
                    'luas_ventilasi' => $luas_ventilasi,
                    'pertukaran' => $pertukaran
                ]);
            }

            Pengukuran::create([
                'slug' => (string) Str::uuid(),
                'ruangan_id' => $request->ruangan_id,
                'kategori_pengukuran_id' => $kategoriId,
                'value' => $realValue,
                'detail_pengukuran' => $detailData,
                'waktu_pengukuran' => $request->waktu_pengukuran,
                'tanggal_pengukuran' => $request->tanggal_pengukuran,
            ]);
        }

        return redirect()->route('home')->with('success', 'Data pengukuran berhasil disimpan.');
    }
}
