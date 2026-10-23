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

    public function existing(Request $request)
    {
        $request->validate([
            'ruangan_id' => 'required|exists:ruangans,id',
            'tanggal_pengukuran' => 'required|date',
            'waktu_pengukuran' => 'required|in:pagi,siang,malam',
        ]);

        $date = date('Y-m-d', strtotime($request->tanggal_pengukuran));

        $records = Pengukuran::where('ruangan_id', $request->ruangan_id)
            ->where('waktu_pengukuran', $request->waktu_pengukuran)
            ->whereDate('tanggal_pengukuran', $date)
            ->get();

        $data = [];
        foreach ($records as $record) {
            // For is_input_2_times categories, keep the latest record only for prefill
            $current = $data[$record->kategori_pengukuran_id] ?? null;
            if ($current === null || $record->id > $current['id']) {
                $data[$record->kategori_pengukuran_id] = [
                    'id' => $record->id,
                    'value' => $record->value,
                    'detail_pengukuran' => $record->detail_pengukuran,
                    'keterangan' => $record->keterangan,
                ];
            }
        }

        return response()->json(['data' => $data]);
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

        $date = date('Y-m-d', strtotime($request->tanggal_pengukuran));

        // Existing records for this ruangan/date/shift, keyed by kategori
        $existingRecords = Pengukuran::where('ruangan_id', $request->ruangan_id)
            ->where('waktu_pengukuran', $request->waktu_pengukuran)
            ->whereDate('tanggal_pengukuran', $date)
            ->get()
            ->keyBy('kategori_pengukuran_id');

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

            // Empty value: remove stale record (if any) instead of keeping old data
            if ($value === null || $value === '' || $value === []) {
                if (isset($existingRecords[$kategoriId]) && ! $kategori?->is_input_2_times) {
                    $existingRecords[$kategoriId]->delete();
                }
                continue;
            }

            // is_input_2_times categories remain append-only
            if ($kategori?->is_input_2_times) {
                Pengukuran::create([
                    'slug' => (string) Str::uuid(),
                    'ruangan_id' => $request->ruangan_id,
                    'kategori_pengukuran_id' => $kategoriId,
                    'value' => $realValue,
                    'detail_pengukuran' => $detailData,
                    'waktu_pengukuran' => $request->waktu_pengukuran,
                    'tanggal_pengukuran' => $request->tanggal_pengukuran,
                    'keterangan' => $request->keterangan ?? null,
                ]);
                continue;
            }

            if (isset($existingRecords[$kategoriId])) {
                $existingRecords[$kategoriId]->update([
                    'value' => $realValue,
                    'detail_pengukuran' => $detailData,
                    'keterangan' => $request->keterangan ?? $existingRecords[$kategoriId]->keterangan,
                    'tanggal_pengukuran' => $request->tanggal_pengukuran,
                ]);
            } else {
                Pengukuran::create([
                    'slug' => (string) Str::uuid(),
                    'ruangan_id' => $request->ruangan_id,
                    'kategori_pengukuran_id' => $kategoriId,
                    'value' => $realValue,
                    'detail_pengukuran' => $detailData,
                    'waktu_pengukuran' => $request->waktu_pengukuran,
                    'tanggal_pengukuran' => $request->tanggal_pengukuran,
                    'keterangan' => $request->keterangan ?? null,
                ]);
            }
        }

        return redirect()->route('home')->with('success', 'Data pengukuran berhasil disimpan.');
    }
}
