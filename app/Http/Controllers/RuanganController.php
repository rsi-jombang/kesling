<?php

namespace App\Http\Controllers;

use App\Models\KategoriPengukuran;
use App\Models\Ruangan;
use App\Models\StandartPengukuran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RuanganController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Ruangan::withCount('pengukurans')->orderBy('nama_ruangan');

        if ($request->filled('search')) {
            $query->where('nama_ruangan', 'like', "%{$request->search}%");
        }

        return Inertia::render('ruangan/index', [
            'data'    => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ruangan/create', [
            'kategoris' => KategoriPengukuran::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'nama_kasi' => 'nullable|string|max:255',
            'panjang' => 'nullable|numeric|min:0',
            'lebar' => 'nullable|numeric|min:0',
            'tinggi' => 'nullable|numeric|min:0',
            'luas_ventilasi_statis' => 'nullable|numeric|min:0',
            'standarts' => 'nullable|array',
            'standarts.*.kategori_id' => 'required|exists:kategori_pengukurans,id',
            'standarts.*.min_value' => 'nullable|numeric',
            'standarts.*.max_value' => 'nullable|numeric',
        ]);

        $ruangan = Ruangan::create([
            'nama_ruangan' => $request->nama_ruangan,
            'nama_kasi' => $request->nama_kasi,
            'panjang' => $request->panjang ?? 0,
            'lebar' => $request->lebar ?? 0,
            'tinggi' => $request->tinggi ?? 0,
            'luas_ventilasi_statis' => $request->luas_ventilasi_statis ?? 0,
        ]);

        if ($request->has('standarts')) {
            foreach ($request->standarts as $std) {
                $kategori = KategoriPengukuran::find($std['kategori_id']);
                if ($std['min_value'] !== null || $std['max_value'] !== null || $kategori->tipe_data === 'checklist_apar') {
                    StandartPengukuran::create([
                        'ruangan_id' => $ruangan->id,
                        'kategori_pengukuran_id' => $std['kategori_id'],
                        'min_value' => $std['min_value'],
                        'max_value' => $std['max_value'],
                        'satuan' => $kategori->satuan,
                    ]);
                }
            }
        }

        return redirect()->route('ruangan.index')->with('message', 'Ruangan berhasil ditambahkan');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ruangan $ruangan)
    {
        return Inertia::render('ruangan/edit', [
            'ruangan' => $ruangan->load('standarts'),
            'kategoris' => KategoriPengukuran::all(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ruangan $ruangan)
    {
        $request->validate([
            'nama_ruangan' => 'required|string|max:255',
            'nama_kasi' => 'nullable|string|max:255',
            'panjang' => 'nullable|numeric|min:0',
            'lebar' => 'nullable|numeric|min:0',
            'tinggi' => 'nullable|numeric|min:0',
            'luas_ventilasi_statis' => 'nullable|numeric|min:0',
            'standarts' => 'nullable|array',
            'standarts.*.kategori_id' => 'required|exists:kategori_pengukurans,id',
            'standarts.*.min_value' => 'nullable|numeric',
            'standarts.*.max_value' => 'nullable|numeric',
        ]);

        $ruangan->update([
            'nama_ruangan' => $request->nama_ruangan,
            'nama_kasi' => $request->nama_kasi,
            'panjang' => $request->panjang ?? 0,
            'lebar' => $request->lebar ?? 0,
            'tinggi' => $request->tinggi ?? 0,
            'luas_ventilasi_statis' => $request->luas_ventilasi_statis ?? 0,
        ]);

        // Sync standards: Delete existing and recreate
        StandartPengukuran::where('ruangan_id', $ruangan->id)->delete();

        if ($request->has('standarts')) {
            foreach ($request->standarts as $std) {
                $kategori = KategoriPengukuran::find($std['kategori_id']);
                if ($std['min_value'] !== null || $std['max_value'] !== null || $kategori->tipe_data === 'checklist_apar') {
                    StandartPengukuran::create([
                        'ruangan_id' => $ruangan->id,
                        'kategori_pengukuran_id' => $std['kategori_id'],
                        'min_value' => $std['min_value'],
                        'max_value' => $std['max_value'],
                        'satuan' => $kategori->satuan,
                    ]);
                }
            }
        }

        return redirect()->route('ruangan.index')->with('success', 'Ruangan berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ruangan $ruangan)
    {
        $ruangan->delete();
        return redirect()->route('ruangan.index')->with('success', 'Ruangan berhasil dihapus');
    }
}
