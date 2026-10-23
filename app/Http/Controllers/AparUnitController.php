<?php

namespace App\Http\Controllers;

use App\Models\AparUnit;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AparUnitController extends Controller
{
    public function index()
    {
        return Inertia::render('apar/index', [
            'units' => AparUnit::with('ruangan')->orderBy('nomor_seri')->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('apar/create', [
            'ruangans' => Ruangan::orderBy('nama_ruangan')->get(['id', 'nama_ruangan']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruangan_id' => 'required|exists:ruangans,id',
            'nomor_seri' => 'required|string|unique:apar_units,nomor_seri',
            'jenis' => 'nullable|string|max:100',
            'kapasitas' => 'nullable|string|max:50',
            'tanggal_kadaluarsa' => 'nullable|date',
            'keterangan' => 'nullable|string',
        ]);

        AparUnit::create($validated);

        return redirect()->route('apar.index')->with('success', 'Unit APAR berhasil ditambahkan.');
    }

    public function edit(AparUnit $apar)
    {
        return Inertia::render('apar/edit', [
            'unit' => $apar->load('ruangan'),
            'ruangans' => Ruangan::orderBy('nama_ruangan')->get(['id', 'nama_ruangan']),
        ]);
    }

    public function update(Request $request, AparUnit $apar)
    {
        $validated = $request->validate([
            'ruangan_id' => 'required|exists:ruangans,id',
            'nomor_seri' => 'required|string|unique:apar_units,nomor_seri,' . $apar->id,
            'jenis' => 'nullable|string|max:100',
            'kapasitas' => 'nullable|string|max:50',
            'tanggal_kadaluarsa' => 'nullable|date',
            'keterangan' => 'nullable|string',
        ]);

        $apar->update($validated);

        return redirect()->route('apar.index')->with('success', 'Unit APAR berhasil diperbarui.');
    }

    public function destroy(AparUnit $apar)
    {
        $apar->delete();

        return redirect()->route('apar.index')->with('success', 'Unit APAR berhasil dihapus.');
    }
}