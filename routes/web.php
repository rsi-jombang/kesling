<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriPengukuranController;
use App\Http\Controllers\PengukuranController;
use App\Http\Controllers\Public\PublicPengukuranController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RuanganController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPengukuranController::class, 'index'])->name('home');
Route::post('/store-pengukuran', [PublicPengukuranController::class, 'store'])->name('public.pengukuran.store');
Route::get('/public/grafik', [App\Http\Controllers\Public\PublicReportController::class, 'grafik'])->name('public.grafik');
Route::get('/public/report/download', [App\Http\Controllers\Public\PublicReportController::class, 'download'])->name('public.report.download');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('dashboard/grafik', [DashboardController::class, 'grafik'])->name('dashboard.grafik');
    Route::resource('ruangan', RuanganController::class);
    Route::resource('kategori', KategoriPengukuranController::class);
    Route::resource('pengukuran', PengukuranController::class);
    Route::get('report', [ReportController::class, 'index'])->name('report.index');
    Route::get('report/download', [ReportController::class, 'download'])->name('report.download');

    // Admin only routes
    Route::middleware(['admin'])->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class);
    });
});

require __DIR__.'/settings.php';
