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
        $ruangans = Ruangan::with(['standarts.kategori'])->orderBy('nama_ruangan')->get();
        $kategoris = KategoriPengukuran::orderBy('nama_kategori')->get(['id', 'nama_kategori', 'satuan']);

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
            'measurements.*' => 'nullable|numeric',
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
            if ($value === null) continue;

            Pengukuran::create([
                'slug' => (string) Str::uuid(),
                'ruangan_id' => $request->ruangan_id,
                'kategori_pengukuran_id' => $kategoriId,
                'value' => $value,
                'waktu_pengukuran' => $request->waktu_pengukuran,
                'tanggal_pengukuran' => $request->tanggal_pengukuran,
            ]);
        }

        return redirect()->route('home')->with('success', 'Data pengukuran berhasil disimpan.');
    }
}
