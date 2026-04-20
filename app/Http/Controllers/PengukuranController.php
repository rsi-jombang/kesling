<?php

namespace App\Http\Controllers;

use App\Models\KategoriPengukuran;
use App\Models\Pengukuran;
use App\Models\Ruangan;
use App\Models\StandartPengukuran;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PengukuranController extends Controller
{
    public function index(Request $request)
    {
        $query = Pengukuran::with(['ruangan', 'kategori_pengukuran'])
            ->orderByDesc('tanggal_pengukuran')
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('ruangan', function($sq) use ($search) {
                    $sq->where('nama_ruangan', 'like', "%{$search}%");
                })->orWhereHas('kategori_pengukuran', function($sq) use ($search) {
                    $sq->where('nama_kategori', 'like', "%{$search}%");
                });
            });
        }

        return Inertia::render('pengukuran/index', [
            'data'    => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('pengukuran/create', [
            'ruangans' => Ruangan::with('standarts.kategori')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ruangan_id'          => 'required|exists:ruangans,id',
            'tanggal_pengukuran'  => 'required|date',
            'waktu_pengukuran'    => 'required|in:pagi,siang,malam',
            'measurements'        => 'required|array',
            'measurements.*'      => 'nullable',
        ]);

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
                'slug'                  => (string) Str::uuid(),
                'ruangan_id'            => $request->ruangan_id,
                'kategori_pengukuran_id'=> $kategoriId,
                'value'                 => $realValue,
                'detail_pengukuran'     => $detailData,
                'waktu_pengukuran'      => $request->waktu_pengukuran,
                'tanggal_pengukuran'    => $request->tanggal_pengukuran,
                'keterangan'            => $request->keterangan ?? null,
            ]);
        }

        return redirect()->route('pengukuran.index')
            ->with('success', 'Data pengukuran berhasil disimpan.');
    }

    public function edit(Pengukuran $pengukuran)
    {
        return Inertia::render('pengukuran/edit', [
            'pengukuran' => $pengukuran->load(['ruangan', 'kategori_pengukuran']),
            'ruangans'   => Ruangan::with('standarts.kategori')->get(),
        ]);
    }

    public function update(Request $request, Pengukuran $pengukuran)
    {
        $request->validate([
            'ruangan_id'                => 'required|exists:ruangans,id',
            'kategori_pengukuran_id'    => 'required|exists:kategori_pengukurans,id',
            'tanggal_pengukuran'        => 'required|date',
            'waktu_pengukuran'          => 'required|in:pagi,siang,malam',
            'value'                     => 'nullable',
            'keterangan'                => 'nullable|string',
        ]);

        $kategori = KategoriPengukuran::find($request->kategori_pengukuran_id);
        $realValue = $request->value;
        $detailData = $pengukuran->detail_pengukuran;

        if ($kategori && $kategori->tipe_data === 'checklist_apar') {
            $realValue = null;
            $detailData = is_array($request->value) ? json_encode($request->value) : $request->value;
        } elseif ($kategori && $kategori->tipe_data === 'rumus_ach') {
            $ruang = Ruangan::find($request->ruangan_id);
            $volume = $ruang->panjang * $ruang->lebar * $ruang->tinggi;
            $luas_ventilasi = $ruang->luas_ventilasi_statis + (float)$request->value;
            $laju_ventilasi = $luas_ventilasi * 60;
            $pertukaran = $laju_ventilasi + (float)$request->value;
            $ach = $volume > 0 ? $pertukaran / $volume : 0;
            
            $realValue = round($ach, 2);
            $detailData = json_encode([
                'input_laju_udara' => $request->value,
                'volume' => $volume,
                'luas_ventilasi' => $luas_ventilasi,
                'pertukaran' => $pertukaran
            ]);
        }

        $pengukuran->update([
            'ruangan_id' => $request->ruangan_id,
            'kategori_pengukuran_id' => $request->kategori_pengukuran_id,
            'tanggal_pengukuran' => $request->tanggal_pengukuran,
            'waktu_pengukuran' => $request->waktu_pengukuran,
            'value' => $realValue,
            'detail_pengukuran' => $detailData,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('pengukuran.index')
            ->with('success', 'Data pengukuran berhasil diperbarui.');
    }

    public function destroy(Pengukuran $pengukuran)
    {
        $pengukuran->delete();
        return redirect()->route('pengukuran.index')
            ->with('success', 'Data pengukuran berhasil dihapus.');
    }
}
