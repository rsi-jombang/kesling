<?php

namespace App\Http\Controllers;

use App\Models\KategoriPengukuran;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KategoriPengukuranController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('kategori/index', [
            'kategoris' => KategoriPengukuran::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategori_pengukurans,nama_kategori',
            'satuan' => 'nullable|string|max:50',
            'tipe_data' => 'required|string|in:numeric,string,boolean,checklist_apar,rumus_ach',
            'is_public' => 'boolean',
            'keterangan' => 'nullable|string',
            'analisa_memenuhi' => 'nullable|string',
            'analisa_tidak_memenuhi' => 'nullable|string',
            'analisa_melebihi_standart' => 'nullable|string',
            'is_input_2_times' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['nama_kategori']);
        $validated['is_public'] = $validated['is_public'] ?? false;
        $validated['is_input_2_times'] = $validated['is_input_2_times'] ?? false;

        KategoriPengukuran::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan');
    }

    public function update(Request $request, KategoriPengukuran $kategori)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategori_pengukurans,nama_kategori,'.$kategori->id,
            'satuan' => 'nullable|string|max:50',
            'tipe_data' => 'required|string|in:numeric,string,boolean,checklist_apar,rumus_ach',
            'is_public' => 'boolean',
            'keterangan' => 'nullable|string',
            'analisa_memenuhi' => 'nullable|string',
            'analisa_tidak_memenuhi' => 'nullable|string',
            'analisa_melebihi_standart' => 'nullable|string',
            'is_input_2_times' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['nama_kategori']);
        $validated['is_public'] = $validated['is_public'] ?? false;
        $validated['is_input_2_times'] = $validated['is_input_2_times'] ?? false;

        $kategori->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui');
    }

    public function destroy(KategoriPengukuran $kategori)
    {
        $kategori->delete();

        return back()->with('success', 'Kategori berhasil dihapus');
    }
}
