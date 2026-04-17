<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\KategoriPengukuran;
use App\Models\Pengukuran;
use App\Models\Ruangan;
use App\Models\StandartPengukuran;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PublicReportController extends Controller
{
    /**
     * AJAX endpoint for public chart data.
     */
    public function grafik(Request $request)
    {
        $ruanganId  = $request->integer('ruangan_id',  Ruangan::first()?->id ?? 0);
        $kategoriId = $request->integer('kategori_id', KategoriPengukuran::first()?->id ?? 0);
        $bulan      = $request->integer('bulan',  now()->month);
        $tahun      = $request->integer('tahun',  now()->year);

        if (! $ruanganId || ! $kategoriId) return response()->json([]);

        $startOfMonth = Carbon::createFromDate($tahun, $bulan, 1)->startOfDay();
        $endOfMonth   = $startOfMonth->copy()->endOfMonth();
        $daysInMonth  = (int) $startOfMonth->daysInMonth;

        $driver  = DB::getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? DB::raw("CAST(strftime('%d', tanggal_pengukuran) AS INTEGER) as hari")
            : DB::raw('DAY(tanggal_pengukuran) as hari');
        $groupDay = $driver === 'sqlite'
            ? DB::raw("strftime('%d', tanggal_pengukuran)")
            : DB::raw('DAY(tanggal_pengukuran)');

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
            ->groupBy('waktu_pengukuran');

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

        $standart = StandartPengukuran::where('ruangan_id', $ruanganId)
            ->where('kategori_pengukuran_id', $kategoriId)
            ->first();

        return response()->json([
            'data'       => $chartData,
            'shifts'     => $shifts,
            'satuan'     => KategoriPengukuran::find($kategoriId)?->satuan ?? '',
            'kategori'   => KategoriPengukuran::find($kategoriId)?->nama_kategori ?? '',
            'ruangan'    => Ruangan::find($ruanganId)?->nama_ruangan ?? '',
            'bulan'      => $bulan,
            'tahun'      => $tahun,
            'min_value'  => $standart?->min_value,
            'max_value'  => $standart?->max_value,
        ]);
    }

    /**
     * Download public PDF report.
     */
    public function download(Request $request)
    {
        $ruanganIds = $request->input('ruangan_ids', []);
        $kategoriId = (int) $request->input('kategori_id');
        $bulan      = (int) $request->input('bulan');
        $tahun      = (int) $request->input('tahun');

        if (empty($ruanganIds) || !$kategoriId) {
            return back()->with('error', 'Pilih ruangan dan kategori terlebih dahulu.');
        }

        $kategori = KategoriPengukuran::findOrFail($kategoriId);
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $reports = [];
        foreach ($ruanganIds as $id) {
            $reports[] = $this->prepareReportData((int)$id, $kategori, $bulan, $tahun);
        }

        $pdf = Pdf::loadView('reports.pengukuran', compact(
            'reports',
            'kategori',
            'bulan',
            'tahun',
            'monthNames'
        ))
        ->setPaper('a4', 'landscape')
        ->setOptions([
            'defaultFont' => 'sans-serif',
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        $filename = sprintf('Laporan_Kesling_%s_%s_%d.pdf',
            str_replace(' ', '_', $kategori->nama_kategori),
            $monthNames[$bulan], $tahun
        );

        return $pdf->download($filename);
    }

    private function prepareReportData(int $ruanganId, KategoriPengukuran $kategori, int $bulan, int $tahun): array
    {
        $ruanganIdInt = (int) $ruanganId;
        $kategoriIdInt = (int) $kategori->id;

        $ruangan  = Ruangan::findOrFail($ruanganIdInt);
        $standart = StandartPengukuran::where('ruangan_id', $ruanganIdInt)
            ->where('kategori_pengukuran_id', $kategoriIdInt)
            ->first();

        $startOfMonth = Carbon::createFromDate($tahun, $bulan, 1)->startOfDay();
        $endOfMonth   = $startOfMonth->copy()->endOfMonth();
        $daysInMonth  = (int) $startOfMonth->daysInMonth;

        $driver = DB::getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? DB::raw("CAST(strftime('%d', tanggal_pengukuran) AS INTEGER) as hari")
            : DB::raw('DAY(tanggal_pengukuran) as hari');
        $groupDay = $driver === 'sqlite'
            ? DB::raw("strftime('%d', tanggal_pengukuran)")
            : DB::raw('DAY(tanggal_pengukuran)');

        $rawRows = Pengukuran::select(
            'waktu_pengukuran',
            $dayExpr,
            DB::raw('ROUND(AVG(value), 2) as avg_value')
        )
            ->where('ruangan_id', $ruanganIdInt)
            ->where('kategori_pengukuran_id', $kategoriIdInt)
            ->whereBetween('tanggal_pengukuran', [$startOfMonth, $endOfMonth])
            ->groupBy('waktu_pengukuran', $groupDay)
            ->get()
            ->groupBy('waktu_pengukuran');

        $shifts = ['pagi', 'siang', 'malam'];
        $matrix = [];
        $allValues = collect();

        foreach ($shifts as $shift) {
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $found = $rawRows->get($shift)?->firstWhere('hari', $d);
                $val = $found ? (float) $found->avg_value : null;
                $matrix[$shift][$d] = $val;
                if ($val !== null) $allValues->push($val);
            }
        }

        $chartData = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $chartData[$d] = [
                'pagi'  => $matrix['pagi'][$d] ?? null,
                'siang' => $matrix['siang'][$d] ?? null,
                'malam' => $matrix['malam'][$d] ?? null,
            ];
        }

        $yMin = $allValues->isEmpty() ? 0 : floor($allValues->min() - 1);
        $yMax = $allValues->isEmpty() ? 10 : ceil($allValues->max() + 1);

        if ($standart) {
            if ($standart->min_value !== null) $yMin = min($yMin, floor((float)$standart->min_value - 1));
            if ($standart->max_value !== null) $yMax = max($yMax, ceil((float)$standart->max_value + 1));
        }
        $yRange = max($yMax - $yMin, 1);

        $chartPng = $this->generateChartPng($chartData, $matrix, $shifts, $daysInMonth, $yMin, $yMax, $yRange, $standart);

        // --- Analisa Otomatis ---
        $avgMonth = $allValues->isEmpty() ? 0 : $allValues->average();
        $isMemenuhi = true;
        if ($standart) {
            if ($standart->min_value !== null && $avgMonth < $standart->min_value) $isMemenuhi = false;
            if ($standart->max_value !== null && $avgMonth > $standart->max_value) $isMemenuhi = false;
        }

        $template = $isMemenuhi
            ? ($kategori->analisa_memenuhi ?? 'Hasil pengukuran memenuhi standar.')
            : ($kategori->analisa_tidak_memenuhi ?? 'Hasil pengukuran belum memenuhi standar.');

        $analisa = str_replace(
            ['{ruangan}', '{kategori}', '{rata_rata}', '{satuan}'],
            [$ruangan->nama_ruangan, $kategori->nama_kategori, number_format($avgMonth, 2), $kategori->satuan],
            $template
        );

        return [
            'ruangan'     => $ruangan,
            'standart'    => $standart,
            'matrix'      => $matrix,
            'chartData'   => $chartData,
            'daysInMonth' => $daysInMonth,
            'yMin'        => $yMin,
            'yMax'        => $yMax,
            'yRange'      => $yRange,
            'shifts'      => $shifts,
            'chartPng'    => $chartPng,
            'analisa'     => $analisa,
            'avgMonth'    => $avgMonth,
            'isMemenuhi'  => $isMemenuhi,
        ];
    }

    private function generateChartPng($chartData, $matrix, $shifts, $daysInMonth, $yMin, $yMax, $yRange, $standart)
    {
        $w = 900; $h = 220; $padL = 50; $padR = 20; $padT = 20; $padB = 30;
        $plotW = $w - $padL - $padR; $plotH = $h - $padT - $padB;
        $img = imagecreatetruecolor($w, $h);
        $white = imagecolorallocate($img, 255, 255, 255);
        $gridCol = imagecolorallocate($img, 230, 230, 230);
        $textCol = imagecolorallocate($img, 80, 80, 80);
        $borderCol = imagecolorallocate($img, 150, 150, 150);
        $redDash = imagecolorallocate($img, 239, 68, 68);
        $shiftRgb = [
            'pagi' => imagecolorallocate($img, 37, 99, 235),
            'siang' => imagecolorallocate($img, 217, 119, 6),
            'malam' => imagecolorallocate($img, 22, 163, 74),
        ];

        imagefill($img, 0, 0, $white);
        $getX = fn($d) => (int) round($padL + ($d - 0.5) * ($plotW / max($daysInMonth, 1)));
        $getY = fn($v) => (int) round($padT + $plotH - (($v - $yMin) / max($yRange, 1)) * $plotH);
        imagerectangle($img, $padL, $padT, $padL + $plotW, $padT + $plotH, $borderCol);

        for ($i = 0; $i <= 5; $i++) {
            $v = $yMin + ($yRange / 5) * $i;
            $py = $getY($v);
            imageline($img, $padL, $py, $padL + $plotW, $py, $gridCol);
            imagestring($img, 1, $padL - (strlen(number_format($v,1)) * 6) - 2, $py - 4, number_format($v,1), $textCol);
        }

        for ($d = 1; $d <= $daysInMonth; $d++) {
            $px = $getX($d);
            imagestring($img, 1, $px - 3, $padT + $plotH + 5, (string)$d, $textCol);
        }

        if ($standart) {
            foreach (['min_value', 'max_value'] as $prop) {
                if ($standart->$prop !== null) {
                    $py = $getY((float)$standart->$prop);
                    for ($x = $padL; $x < $padL + $plotW; $x += 8) { imageline($img, $x, $py, min($x + 4, $padL + $plotW), $py, $redDash); }
                }
            }
        }

        foreach ($shifts as $shift) {
            $col = $shiftRgb[$shift];
            $prev = null;
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $val = $chartData[$d][$shift]; if ($val === null) { $prev = null; continue; }
                $cx = $getX($d); $cy = $getY($val);
                if ($prev !== null) { foreach ([-1, 0, 1] as $o) { imageline($img, $prev[0], $prev[1] + $o, $cx, $cy + $o, $col); } }
                imagefilledellipse($img, $cx, $cy, 6, 6, $col); $prev = [$cx, $cy];
            }
        }

        ob_start(); imagepng($img); $png = ob_get_clean(); imagedestroy($img);
        return base64_encode($png);
    }
}
