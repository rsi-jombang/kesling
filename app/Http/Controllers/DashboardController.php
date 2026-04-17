<?php

namespace App\Http\Controllers;

use App\Models\KategoriPengukuran;
use App\Models\Pengukuran;
use App\Models\Ruangan;
use App\Models\StandartPengukuran;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $today     = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // ── Stat Cards ─────────────────────────────────────────────────
        $totalPengukuranHariIni  = Pengukuran::whereDate('tanggal_pengukuran', $today)->count();
        $totalPengukuranBulanIni = Pengukuran::where('tanggal_pengukuran', '>=', $thisMonth)->count();
        $totalMemenuhi           = Pengukuran::where('tanggal_pengukuran', '>=', $thisMonth)->where('status', 'memenuhi')->count();
        $totalTidakMemenuhi      = Pengukuran::where('tanggal_pengukuran', '>=', $thisMonth)->where('status', 'tidak memenuhi')->count();
        $persentaseMemenuhi      = $totalPengukuranBulanIni > 0
            ? round(($totalMemenuhi / $totalPengukuranBulanIni) * 100, 1) : 0;

        // ── Rekap per Ruangan (bulan ini) ──────────────────────────────
        $rekapRuangan = Ruangan::withCount([
            'pengukurans as total'           => fn($q) => $q->where('tanggal_pengukuran', '>=', $thisMonth),
            'pengukurans as memenuhi'        => fn($q) => $q->where('tanggal_pengukuran', '>=', $thisMonth)->where('status', 'memenuhi'),
            'pengukurans as tidak_memenuhi'  => fn($q) => $q->where('tanggal_pengukuran', '>=', $thisMonth)->where('status', 'tidak memenuhi'),
        ])->get()->map(fn($r) => [
            'id'              => $r->id,
            'nama_ruangan'    => $r->nama_ruangan,
            'total'           => $r->total,
            'memenuhi'        => $r->memenuhi,
            'tidak_memenuhi'  => $r->tidak_memenuhi,
            'persen_memenuhi' => $r->total > 0 ? round(($r->memenuhi / $r->total) * 100) : 0,
        ]);

        // ── Tren 7 hari terakhir ───────────────────────────────────────
        $tren = collect(range(6, 0))->map(function ($daysAgo) {
            $date          = Carbon::today()->subDays($daysAgo);
            $memenuhi      = Pengukuran::whereDate('tanggal_pengukuran', $date)->where('status', 'memenuhi')->count();
            $tidakMemenuhi = Pengukuran::whereDate('tanggal_pengukuran', $date)->where('status', 'tidak memenuhi')->count();
            return [
                'tanggal'        => $date->format('d M'),
                'memenuhi'       => $memenuhi,
                'tidak_memenuhi' => $tidakMemenuhi,
                'total'          => $memenuhi + $tidakMemenuhi,
            ];
        });

        // ── Data Terbaru (10 terakhir) ─────────────────────────────────
        $pengukuranTerbaru = Pengukuran::with(['ruangan', 'kategori_pengukuran'])
            ->latest('tanggal_pengukuran')->latest('created_at')->limit(10)->get()
            ->map(fn($p) => [
                'id'      => $p->id,
                'ruangan' => $p->ruangan->nama_ruangan,
                'kategori'=> $p->kategori_pengukuran->nama_kategori,
                'satuan'  => $p->kategori_pengukuran->satuan,
                'value'   => $p->value,
                'status'  => $p->status,
                'waktu'   => $p->waktu_pengukuran,
                'tanggal' => Carbon::parse($p->tanggal_pengukuran)->format('d M Y'),
            ]);

        // ── Alert Tidak Memenuhi ───────────────────────────────────────
        $alertTidakMemenuhi = Pengukuran::with(['ruangan', 'kategori_pengukuran'])
            ->where('status', 'tidak memenuhi')
            ->where('tanggal_pengukuran', '>=', Carbon::today()->subDays(3))
            ->latest('tanggal_pengukuran')->limit(5)->get()
            ->map(fn($p) => [
                'id'      => $p->id,
                'ruangan' => $p->ruangan->nama_ruangan,
                'kategori'=> $p->kategori_pengukuran->nama_kategori,
                'value'   => $p->value,
                'satuan'  => $p->kategori_pengukuran->satuan,
                'waktu'   => $p->waktu_pengukuran,
                'tanggal' => Carbon::parse($p->tanggal_pengukuran)->format('d M Y'),
            ]);

        // ── Data Grafik Harian (filter-aware) ─────────────────────────
        $grafikData = $this->buildGrafikData($request);

        return Inertia::render('dashboard', [
            'stats'              => compact(
                'totalPengukuranHariIni', 'totalPengukuranBulanIni',
                'totalMemenuhi', 'totalTidakMemenuhi', 'persentaseMemenuhi'
            ) + [
                'totalRuangan'  => Ruangan::count(),
                'totalKategori' => KategoriPengukuran::count(),
            ],
            'rekapRuangan'       => $rekapRuangan,
            'tren'               => $tren,
            'pengukuranTerbaru'  => $pengukuranTerbaru,
            'alertTidakMemenuhi' => $alertTidakMemenuhi,

            // Grafik harian
            'grafikData'         => $grafikData,
            'ruangans'           => Ruangan::orderBy('nama_ruangan')->get(['id', 'nama_ruangan']),
            'kategoris'          => KategoriPengukuran::orderBy('nama_kategori')->get(['id', 'nama_kategori', 'satuan']),
            'filterDefault'      => [
                'ruangan_id'  => $request->integer('ruangan_id', Ruangan::first()?->id ?? 0),
                'kategori_id' => $request->integer('kategori_id', KategoriPengukuran::first()?->id ?? 0),
                'bulan'       => $request->integer('bulan', now()->month),
                'tahun'       => $request->integer('tahun', now()->year),
            ],
        ]);
    }

    /**
     * Build daily-average data per shift for the chart.
     * Filter: ruangan_id + kategori_id + bulan + tahun
     * Output: each row = 1 day, columns = shift (pagi | siang | malam)
     */
    private function buildGrafikData(Request $request): array
    {
        $ruanganId  = $request->integer('ruangan_id',  Ruangan::first()?->id ?? 0);
        $kategoriId = $request->integer('kategori_id', KategoriPengukuran::first()?->id ?? 0);
        $bulan      = $request->integer('bulan',  now()->month);
        $tahun      = $request->integer('tahun',  now()->year);

        if (! $ruanganId || ! $kategoriId) return [];

        $startOfMonth = Carbon::createFromDate($tahun, $bulan, 1)->startOfDay();
        $endOfMonth   = $startOfMonth->copy()->endOfMonth();
        $daysInMonth  = (int) $startOfMonth->daysInMonth;

        // SQLite vs MySQL date extract
        $driver  = DB::getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? DB::raw("CAST(strftime('%d', tanggal_pengukuran) AS INTEGER) as hari")
            : DB::raw('DAY(tanggal_pengukuran) as hari');
        $groupDay = $driver === 'sqlite'
            ? DB::raw("strftime('%d', tanggal_pengukuran)")
            : DB::raw('DAY(tanggal_pengukuran)');

        // avg per (shift, day)
        $rows = Pengukuran::select(
                'waktu_pengukuran',
                $dayExpr,
                DB::raw('ROUND(AVG(value), 2) as avg_value')
            )
            ->where('ruangan_id', $ruanganId)
            ->where('kategori_pengukuran_id', $kategoriId)
            ->whereBetween('tanggal_pengukuran', [$startOfMonth, $endOfMonth])
            ->groupBy('waktu_pengukuran', $groupDay)
            ->get()
            ->groupBy('waktu_pengukuran');   // keyed by shift name

        // Build [ { label:'01', pagi: 22.5, siang: 24.1, malam: 21.8 }, ... ]
        $shifts    = ['pagi', 'siang', 'malam'];
        $chartData = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $entry = ['hari' => $day, 'label' => sprintf('%02d', $day)];
            foreach ($shifts as $shift) {
                $found = $rows->get($shift)?->firstWhere('hari', $day);
                $entry[$shift] = $found ? (float) $found->avg_value : null;
            }
            $chartData[] = $entry;
        }

        // Resolve standart for this ruangan+kategori
        $standart = StandartPengukuran::where('ruangan_id', $ruanganId)
            ->where('kategori_pengukuran_id', $kategoriId)
            ->first();

        return [
            'data'       => $chartData,
            'shifts'     => $shifts,
            'satuan'     => KategoriPengukuran::find($kategoriId)?->satuan ?? '',
            'kategori'   => KategoriPengukuran::find($kategoriId)?->nama_kategori ?? '',
            'ruangan'    => Ruangan::find($ruanganId)?->nama_ruangan ?? '',
            'bulan'      => $bulan,
            'tahun'      => $tahun,
            'min_value'  => $standart?->min_value,
            'max_value'  => $standart?->max_value,
        ];
    }

    /** AJAX endpoint for chart filter */
    public function grafik(Request $request)
    {
        return response()->json($this->buildGrafikData($request));
    }
}
