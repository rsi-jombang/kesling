<?php

namespace Database\Seeders;

use App\Models\KategoriPengukuran;
use App\Models\Pengukuran;
use App\Models\Ruangan;
use App\Models\StandartPengukuran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class KeslingSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Ruangan ──────────────────────────────────────────────────
        $ruanganData = [
            'ICU (Intensive Care Unit)',
            'IGD (Instalasi Gawat Darurat)',
            'Ruang Operasi',
            'Ruang Rawat Inap Umum',
            'Laboratorium',
            'Ruang Isolasi',
        ];

        $ruangans = collect($ruanganData)->map(
            fn($nama) => Ruangan::firstOrCreate(['nama_ruangan' => $nama])
        );

        // ── 2. Kategori Pengukuran ──────────────────────────────────────
        $kategoriData = [
            [
                'nama_kategori' => 'Suhu Ruang',
                'satuan' => '°C',
                'tipe_data' => 'numeric',
                'slug' => 'suhu-ruang',
                'analisa_memenuhi' => 'Analisa hasil monitoring engineering {kategori} di {ruangan} (rata-rata: {rata_rata} {satuan}) selama satu bulan dilihat dari alat pengukur suhu ruang telah memenuhi standar. Pemeliharaan rutin pada sistem pendingin udara perlu dipertahankan.',
                'analisa_tidak_memenuhi' => 'Analisa hasil monitoring engineering {kategori} di {ruangan} (rata-rata: {rata_rata} {satuan}) selama satu bulan dilihat dari alat pengukur suhu ruang belum memenuhi standar. Sehingga perlu dilakukan pengaturan suhu pada pendingin udara dan pemeliharaan jika memakai AC, jika ruangan tidak memakai AC bisa menambahkan exhaust.',
            ],
            [
                'nama_kategori' => 'Kelembaban Relatif',
                'satuan' => '%',
                'tipe_data' => 'numeric',
                'slug' => 'kelembaban-relatif',
                'analisa_memenuhi' => 'Analisa hasil monitoring {kategori} di {ruangan} dengan rata-rata {rata_rata}{satuan} telah memenuhi standar kesehatan lingkungan. Kondisi ini mendukung kenyamanan pasien dan mencegah pertumbuhan jamur.',
                'analisa_tidak_memenuhi' => 'Analisa hasil monitoring {kategori} di {ruangan} dengan rata-rata {rata_rata}{satuan} belum memenuhi standar. Kelembaban yang terlalu tinggi/rendah dapat mengganggu kesehatan. Disarankan pengecekan filter AC, penggunaan dehumidifier, atau perbaikan sirkulasi udara.',
            ],
            [
                'nama_kategori' => 'Kadar CO₂',
                'satuan' => 'ppm',
                'tipe_data' => 'numeric',
                'slug' => 'kadar-co2',
                'analisa_memenuhi' => 'Monitoring {kategori} di {ruangan} menunjukkan rata-rata {rata_rata} {satuan}, berada dalam batas aman standar ventilasi ruangan yang baik.',
                'analisa_tidak_memenuhi' => 'Kadar {kategori} di {ruangan} rata-rata mencapai {rata_rata} {satuan}, melebihi ambang batas yang disarankan. Hal ini mengindikasikan ventilasi yang kurang memadai. Segera optimalkan pertukaran udara segar (air change rate) di ruangan tersebut.',
            ],
            [
                'nama_kategori' => 'Tingkat Kebisingan',
                'satuan' => 'dB',
                'tipe_data' => 'numeric',
                'slug' => 'tingkat-kebisingan',
                'analisa_memenuhi' => 'Tingkat kebisingan di {ruangan} (rata-rata: {rata_rata} {satuan}) telah memenuhi standar kebisingan untuk area rumah sakit, mendukung ketenangan istirahat pasien.',
                'analisa_tidak_memenuhi' => 'Tingkat kebisingan di {ruangan} rata-rata {rata_rata} {satuan}, belum memenuhi standar ketenangan. Perlu dilakukan pengecekan sumber bising (mesin/aktivitas) dan upaya peredaman atau pengaturan jadwal operasional alat berat.',
            ],
            [
                'nama_kategori' => 'Pencahayaan',
                'satuan' => 'lux',
                'tipe_data' => 'numeric',
                'slug' => 'pencahayaan',
                'analisa_memenuhi' => 'Hasil pemantauan {kategori} di {ruangan} rata-rata {rata_rata} {satuan}, sudah memenuhi standar minimal pencahayaan untuk mendukung fungsi medis di ruangan tersebut.',
                'analisa_tidak_memenuhi' => 'Hasil pemantauan {kategori} di {ruangan} rata-rata {rata_rata} {satuan}, belum memenuhi standar pencahayaan. Disarankan penggantian lampu dengan daya yang sesuai, penambahan titik lampu, atau pembersihan kap lampu secara rutin.',
            ],
            [
                'nama_kategori' => 'Kecepatan Udara',
                'satuan' => 'm/s',
                'tipe_data' => 'numeric',
                'slug' => 'kecepatan-udara',
                'analisa_memenuhi' => 'Aliran udara di {ruangan} dengan rata-rata {rata_rata} {satuan} telah memenuhi standar distribusi udara yang sehat.',
                'analisa_tidak_memenuhi' => 'Laju aliran udara di {ruangan} rata-rata {rata_rata} {satuan}, belum memenuhi standar sirkulasi. Perlu dilakukan pengecekan pada sistem diffuser, pembersihan filter, atau penyesuaian kecepatan fan pada unit AHU/AC.',
            ],
        ];

        $kategoris = collect($kategoriData)->map(
            fn($k) => KategoriPengukuran::updateOrCreate(
                ['nama_kategori' => $k['nama_kategori']],
                $k
            )
        );

        // ── 3. Standart Pengukuran per Ruangan ─────────────────────────
        // Format: [min, max] — berdasarkan standar Kemenkes RI
        $standarPerRuangan = [
            'ICU (Intensive Care Unit)' => [
                'Suhu Udara'         => [20, 24],
                'Kelembaban Relatif' => [45, 60],
                'Kadar CO₂'          => [null, 800],
                'Tingkat Kebisingan' => [null, 40],
                'Pencahayaan'        => [300, 500],
                'Kecepatan Udara'    => [0.1, 0.3],
            ],
            'IGD (Instalasi Gawat Darurat)' => [
                'Suhu Udara'         => [22, 26],
                'Kelembaban Relatif' => [40, 60],
                'Kadar CO₂'          => [null, 1000],
                'Tingkat Kebisingan' => [null, 45],
                'Pencahayaan'        => [200, 500],
                'Kecepatan Udara'    => [0.1, 0.5],
            ],
            'Ruang Operasi' => [
                'Suhu Udara'         => [19, 24],
                'Kelembaban Relatif' => [45, 60],
                'Kadar CO₂'          => [null, 700],
                'Tingkat Kebisingan' => [null, 35],
                'Pencahayaan'        => [500, 1000],
                'Kecepatan Udara'    => [0.1, 0.2],
            ],
            'Ruang Rawat Inap Umum' => [
                'Suhu Udara'         => [22, 28],
                'Kelembaban Relatif' => [40, 70],
                'Kadar CO₂'          => [null, 1200],
                'Tingkat Kebisingan' => [null, 45],
                'Pencahayaan'        => [100, 300],
                'Kecepatan Udara'    => [0.1, 0.5],
            ],
            'Laboratorium' => [
                'Suhu Udara'         => [20, 25],
                'Kelembaban Relatif' => [40, 60],
                'Kadar CO₂'          => [null, 1000],
                'Tingkat Kebisingan' => [null, 50],
                'Pencahayaan'        => [300, 750],
                'Kecepatan Udara'    => [0.1, 0.4],
            ],
            'Ruang Isolasi' => [
                'Suhu Udara'         => [21, 25],
                'Kelembaban Relatif' => [40, 60],
                'Kadar CO₂'          => [null, 800],
                'Tingkat Kebisingan' => [null, 40],
                'Pencahayaan'        => [100, 300],
                'Kecepatan Udara'    => [0.1, 0.3],
            ],
        ];

        $kategoriMap = $kategoris->keyBy('nama_kategori');

        foreach ($ruangans as $ruangan) {
            $standar = $standarPerRuangan[$ruangan->nama_ruangan] ?? [];
            foreach ($standar as $namaKat => [$min, $max]) {
                $kat = $kategoriMap->get($namaKat);
                if (! $kat) continue;

                StandartPengukuran::firstOrCreate(
                    ['ruangan_id' => $ruangan->id, 'kategori_pengukuran_id' => $kat->id],
                    ['min_value' => $min, 'max_value' => $max, 'satuan' => $kat->satuan]
                );
            }
        }

        // // ── 4. Data Pengukuran (2 bulan terakhir, 3x shift/hari) ───────
        // $this->command->info('Generating pengukuran data...');

        // // Range: 60 hari ke belakang (sekitar 2 bulan)
        // $startDate = Carbon::today()->subDays(59);
        // $endDate   = Carbon::today();
        // $shifts    = ['pagi', 'siang', 'malam'];

        // // Nilai referensi realistis per (ruangan, kategori) — tengah standar
        // $nilaiRef = [
        //     'ICU (Intensive Care Unit)' => [
        //         'Suhu Udara' => 22.0, 'Kelembaban Relatif' => 52, 'Kadar CO₂' => 620,
        //         'Tingkat Kebisingan' => 35, 'Pencahayaan' => 380, 'Kecepatan Udara' => 0.20,
        //     ],
        //     'IGD (Instalasi Gawat Darurat)' => [
        //         'Suhu Udara' => 24.0, 'Kelembaban Relatif' => 50, 'Kadar CO₂' => 750,
        //         'Tingkat Kebisingan' => 40, 'Pencahayaan' => 320, 'Kecepatan Udara' => 0.28,
        //     ],
        //     'Ruang Operasi' => [
        //         'Suhu Udara' => 21.5, 'Kelembaban Relatif' => 53, 'Kadar CO₂' => 580,
        //         'Tingkat Kebisingan' => 30, 'Pencahayaan' => 720, 'Kecepatan Udara' => 0.15,
        //     ],
        //     'Ruang Rawat Inap Umum' => [
        //         'Suhu Udara' => 25.0, 'Kelembaban Relatif' => 55, 'Kadar CO₂' => 900,
        //         'Tingkat Kebisingan' => 42, 'Pencahayaan' => 180, 'Kecepatan Udara' => 0.28,
        //     ],
        //     'Laboratorium' => [
        //         'Suhu Udara' => 22.5, 'Kelembaban Relatif' => 50, 'Kadar CO₂' => 780,
        //         'Tingkat Kebisingan' => 44, 'Pencahayaan' => 500, 'Kecepatan Udara' => 0.22,
        //     ],
        //     'Ruang Isolasi' => [
        //         'Suhu Udara' => 23.0, 'Kelembaban Relatif' => 50, 'Kadar CO₂' => 660,
        //         'Tingkat Kebisingan' => 36, 'Pencahayaan' => 190, 'Kecepatan Udara' => 0.20,
        //     ],
        // ];

        // // Deviasi (amplitude variasi) per kategori
        // $deviasi = [
        //     'Suhu Udara' => 2.5, 'Kelembaban Relatif' => 8.0, 'Kadar CO₂' => 180,
        //     'Tingkat Kebisingan' => 8.0, 'Pencahayaan' => 80, 'Kecepatan Udara' => 0.10,
        // ];

        // $inserted = 0;
        // $date = $startDate->copy();

        // while ($date->lte($endDate)) {
        //     // Lewati 20% hari secara acak (simulasi hari tanpa pengukuran)
        //     if (rand(1, 100) <= 20) {
        //         $date->addDay();
        //         continue;
        //     }

        //     foreach ($ruangans as $ruangan) {
        //         $standar = $standarPerRuangan[$ruangan->nama_ruangan] ?? [];
        //         $refRuangan = $nilaiRef[$ruangan->nama_ruangan] ?? [];

        //         foreach ($shifts as $shift) {
        //             // Lewati 30% shift acak (tidak semua shift selalu terisi)
        //             if (rand(1, 100) <= 30) continue;

        //             foreach ($standar as $namaKat => [$min, $max]) {
        //                 $kat = $kategoriMap->get($namaKat);
        //                 if (! $kat) continue;

        //                 $ref = $refRuangan[$namaKat] ?? (($min ?? 0 + $max ?? 100) / 2);
        //                 $dev = $deviasi[$namaKat] ?? 1.0;

        //                 // Gaussian-ish noise via Box-Muller approximation
        //                 $noise = (array_sum(array_map(fn() => (mt_rand() / mt_getrandmax()) - 0.5, range(1, 4)))) * $dev;
        //                 $value = round($ref + $noise, 2);

        //                 // Pastikan nilai tidak negatif
        //                 $value = max(0, $value);

        //                 Pengukuran::create([
        //                     'slug'                   => (string) Str::uuid(),
        //                     'ruangan_id'             => $ruangan->id,
        //                     'kategori_pengukuran_id' => $kat->id,
        //                     'value'                  => $value,
        //                     'waktu_pengukuran'       => $shift,
        //                     'tanggal_pengukuran'     => $date->format('Y-m-d'),
        //                     'keterangan'             => null,
        //                 ]);

        //                 $inserted++;
        //             }
        //         }
        //     }

        //     $date->addDay();
        // }

        // $this->command->info("✅ Selesai! {$inserted} data pengukuran berhasil dibuat.");
    }
}
