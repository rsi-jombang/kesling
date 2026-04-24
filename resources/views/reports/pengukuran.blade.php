<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Monitoring Kesling</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #111;
            background: #fff;
            padding: 14px 18px;
        }

        .page-wrapper {
            page-break-after: always;
            position: relative;
        }
        .page-wrapper:last-child {
            page-break-after: auto;
        }

        /* ── Fixed Footer ───────────────────────────────── */
        @page {
            margin: 1cm 1.5cm 1.5cm 1.5cm;
        }
        .footer-info {
            position: fixed;
            bottom: -0.8cm;
            left: 0;
            right: 0;
            width: 100%;
            font-size: 8px;
            color: #999;
            text-align: left;
            border-top: 0.5px solid #eee;
            padding-top: 5px;
            z-index: 1000;
        }

        /* ── Header ─────────────────────────────────────── */
        .header {
            text-align: center;
            margin-bottom: 10px;
            border-bottom: 2.5px solid #1a1a2e;
            padding-bottom: 8px;
        }
        .header .hospital-name {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1a1a2e;
        }
        .header .hospital-sub {
            font-size: 9px;
            color: #444;
            margin-top: 2px;
        }
        .report-title {
            text-align: center;
            margin: 8px 0;
        }
        .report-title h2 {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .report-title .subtitle {
            font-size: 10px;
            font-weight: bold;
            margin-top: 2px;
            color: #1a1a2e;
        }

        /* ── Meta info ───────────────────────────────────── */
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 9px;
        }
        .meta-table td { padding: 1.5px 6px; vertical-align: top; }
        .meta-table .label { font-weight: bold; width: 100px; }
        .meta-table .colon { width: 10px; }

        /* ── Chart Layout ────────────────────────────────── */
        .chart-box {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 4px;
            background: #fafbff;
            text-align: center;
        }

        .legend-table {
            width: 100%;
            margin-top: 6px;
            font-size: 8.5px;
        }
        .legend-marker {
            display: inline-block;
            width: 20px;
            height: 3px;
            margin-right: 5px;
            vertical-align: middle;
            border-radius: 1px;
        }
        .legend-marker-dot {
            display: inline-block;
            width: 20px;
            height: 1px;
            margin-right: 5px;
            vertical-align: middle;
            border-top: 1.5px dashed #ef4444;
        }

        /* ── Data Table ──────────────────────────────────── */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 8px;
        }
        .data-table th, .data-table td {
            border: 0.5px solid #aaa;
            text-align: center;
            padding: 3px 1px;
        }
        .data-table thead th {
            background: #1a1a2e;
            color: #fff;
            font-weight: bold;
        }
        .data-table .shift-label {
            background: #f0f4ff;
            font-weight: bold;
            text-align: left;
            padding-left: 6px;
            width: 60px;
        }
        .data-table td.empty { color: #bbb; }
        .data-table td.ok { background: #e8fef0; color: #166534; font-weight: bold; }
        .data-table td.nok { background: #fff1f2; color: #9f1239; font-weight: bold; }

        /* ── Summary ─────────────────────────────────────── */
        .summary-table {
            width: 100%;
            margin-top: 10px;
            border: 1px solid #ddd;
            background: #f8faff;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 6px 15px;
            font-size: 9px;
            border-right: 1px solid #eee;
        }

        /* ── Signature Table ────────────────────────────── */
        .footer-table {
            width: 100%;
            margin-top: 20px;
            border-collapse: collapse;
        }
        .footer-table td {
            width: 33.3%;
            vertical-align: bottom;
            text-align: center;
            font-size: 9px;
        }

        /* ── Analisa Section ────────────────────────────── */
        .analisa-box {
            margin-top: 12px;
            padding: 10px;
            background: #fcfcfc;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .analisa-title {
            font-size: 10px;
            font-weight: bold;
            color: #1a1a2e;
            margin-bottom: 5px;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
            text-transform: uppercase;
        }
        .analisa-content {
            font-size: 9.5px;
            line-height: 1.5;
            color: #222;
            text-align: justify;
        }
    </style>
</head>
<body>
    {{-- Fixed Footer for dompdf: must be defined outside loop/wrapper for consistency --}}
    <div class="footer-info">
        Informasi Sistem: Laporan ini digenerate secara otomatis oleh Kesling Monitor System - Dicetak pada: {{ now()->format('d/m/Y H:i') }} WIB
    </div>

@foreach($reports as $report)
<div class="page-wrapper">
    {{-- ── Kop Surat ───────────────────────────────────────────────────────── --}}
    <div class="header">
        <div class="hospital-name">RUMAH SAKIT ISLAM JOMBANG</div>
        <div class="hospital-sub">Jl. Brigjen Kretarto 22 A, Jombang, Jawa Timur 61413 — Telp. (0321) 860074 (Operator)</div>
    </div>

    <div class="report-title">
        <h2>LAPORAN MONITORING ENGINEERING</h2>
        <div class="subtitle">
            {{ strtoupper($kategori->nama_kategori) }} — {{ strtoupper($report['ruangan']->nama_ruangan) }}
        </div>
    </div>

    {{-- ── Meta ────────────────────────────────────────────────────────────── --}}
    <table class="meta-table">
        <tr>
            <td class="label">Ruangan</td>
            <td class="colon">:</td>
            <td style="width: 250px;">{{ $report['ruangan']->nama_ruangan }}</td>
            <td class="label">Periode</td>
            <td class="colon">:</td>
            <td>{{ $monthNames[$bulan] }} {{ $tahun }}</td>
        </tr>
        <tr>
            <td class="label">Parameter</td>
            <td class="colon">:</td>
            <td>{{ $kategori->nama_kategori }} ({{ $kategori->satuan }})</td>
            @if($report['standart'])
            <td class="label">Nilai Standar</td>
            <td class="colon">:</td>
            <td>
                {{ $report['standart']->min_value ?? '∞' }} – {{ $report['standart']->max_value ?? '∞' }} {{ $kategori->satuan }}
            </td>
            @else
            <td></td><td></td><td></td>
            @endif
        </tr>
    </table>

    {{-- ── Grafik ──────────────────────────────────────────────────────────── --}}
    @php
        $shiftColors = ['pagi' => '#2563eb', 'siang' => '#d9d906', 'malam' => '#16a34a'];
        $shiftLabels = ['pagi' => 'Pagi', 'siang' => 'Siang', 'malam' => 'Malam'];
    @endphp

    <div class="chart-box">
        <img src="data:image/png;base64,{{ $report['chartPng'] }}"
             style="width:100%; height:auto; display:block;" />

        {{-- Legend --}}
        <table class="legend-table">
            <tr>
                <td style="text-align: center;">
                    @foreach($report['shifts'] as $shift)
                        <span style="margin: 0 10px;">
                            <span class="legend-marker" style="background: {{ $shiftColors[$shift] }}"></span>
                            {{ $shiftLabels[$shift] }}
                        </span>
                    @endforeach
                    @if($report['standart'])
                        <span style="margin: 0 10px;">
                            <span class="legend-marker-dot"></span>
                            Batas Standar
                        </span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- ── Data Table ──────────────────────────────────────────────────────── --}}
    <table class="data-table">
        <thead>
            <tr>
                <th class="shift-label">Shift</th>
                @for($d = 1; $d <= $report['daysInMonth']; $d++)
                    <th>{{ $d }}</th>
                @endfor
                <th style="width:35px;">Rata²</th>
            </tr>
        </thead>
        <tbody>
            @foreach($report['shifts'] as $shift)
                @php
                    $vals = collect($report['matrix'][$shift])->filter()->values();
                    $avg  = $vals->isNotEmpty() ? round($vals->average(), 2) : '-';
                @endphp
                <tr>
                    <td class="shift-label">{{ $shiftLabels[$shift] }}</td>
                    @for($d = 1; $d <= $report['daysInMonth']; $d++)
                        @php
                            $v = $report['matrix'][$shift][$d];
                            $class = '';
                            if ($v !== null && $report['standart']) {
                                // Bug fix: Normalisasi Min/Max
                                $v1 = $report['standart']->min_value !== null ? (float)$report['standart']->min_value : null;
                                $v2 = $report['standart']->max_value !== null ? (float)$report['standart']->max_value : null;

                                $min = ($v1 !== null && $v2 !== null) ? min($v1, $v2) : ($v1 ?? null);
                                $max = ($v1 !== null && $v2 !== null) ? max($v1, $v2) : ($v2 ?? null);

                                $ok = ($min === null || $v >= $min) && ($max === null || $v <= $max);
                                $class = $ok ? 'ok' : 'nok';
                            }
                        @endphp
                        <td class="{{ $v === null ? 'empty' : $class }}">
                            {{ $v ?? '-' }}
                        </td>
                    @endfor
                    <td style="font-weight:bold;background:#f0fafe;">{{ $avg }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- ── Summary ─────────────────────────────────────────────────────────── --}}
    @php
        $allVals = collect($report['matrix'])->flatten()->filter();
        $tot   = $allVals->count();
        $ok    = 0;
        foreach($report['matrix'] as $s => $days) {
            foreach($days as $v) {
                if ($v === null) continue;
                if (!$report['standart']) { $ok++; continue; }

                $v1 = $report['standart']->min_value !== null ? (float)$report['standart']->min_value : null;
                $v2 = $report['standart']->max_value !== null ? (float)$report['standart']->max_value : null;

                $min = ($v1 !== null && $v2 !== null) ? min($v1, $v2) : ($v1 ?? null);
                $max = ($v1 !== null && $v2 !== null) ? max($v1, $v2) : ($v2 ?? null);

                $is_ok = ($min === null || $v >= $min) && ($max === null || $v <= $max);
                if ($is_ok) $ok++;
            }
        }
        $nok = $tot - $ok;
        $rate = $tot > 0 ? round($ok / $tot * 100, 1) : 0;
    @endphp
    <table class="summary-table">
        <tr>
            <td><strong>Total Pengukuran:</strong> {{ $tot }} Data</td>
            <td><strong>Memenuhi Standar:</strong> <span style="color:#166534;font-weight:bold;">{{ $ok }}</span></td>
            <td><strong>Tidak Memenuhi:</strong> <span style="color:#9f1239;font-weight:bold;">{{ $nok }}</span></td>
            <td style="border:none;"><strong>Presentase:</strong> <span style="font-size:11px;font-weight:bold;">{{ $rate }}%</span></td>
        </tr>
    </table>

    {{-- ── IV. Analisa Masalah & Saran ────────────────────────────────── --}}
    <div class="analisa-box">
        <div class="analisa-title">IV. ANALISA MASALAH & SARAN</div>
        <div class="analisa-content">
            {{ $report['analisa'] ?? 'Tidak ada analisa untuk periode ini.' }}
        </div>
    </div>

    {{-- Signature Section --}}
    {{-- Signature Section --}}
    <table class="footer-table" style="width: 100%; margin-top: 20px;">
        <tr>
            {{-- <td style="width: 33.3%; text-align: center; vertical-align: top;">
                <br>
                <strong>Kasi Ruangan,</strong>
                <div style="margin-top: 60px;">
                    <div style="border-top: 1px solid #000; width: 170px; margin: 0 auto; padding-top: 5px; font-weight: bold;">
                        ( {{ $report['ruangan']->nama_kasi ?? '.........................................' }} )
                    </div>
                </div>
            </td> --}}
            <td style="width: 33.3%; text-align: center; vertical-align: top;">
                Jombang, {{ now()->format('d m Y') }}<br>
                <strong>Mengetahui,</strong>
                <div style="margin-bottom: 5px;">IPCN</div>
                <div style="margin-top: 45px;">
                    <div style="border-top: 1px solid #000; width: 150px; margin: 0 auto; padding-top: 5px; font-weight: bold;">
                        ( Miftakhul Jannah S.Kep.,Ns )
                    </div>
                </div>
            </td>
            <td style="width: 33.3%; text-align: center; vertical-align: top;">
                <br>
                <strong>Pelaksana Kesehatan Lingkungan,</strong>
                <div style="margin-top: 60px;">
                    <div style="border-top: 1px solid #000; width: 150px; margin: 0 auto; padding-top: 5px; font-weight: bold;">
                        ( Irtifaun Nisa' A.Md.Kes )
                    </div>
                </div>
            </td>
        </tr>
    </table>
</div>
@endforeach

</body>
</html>
