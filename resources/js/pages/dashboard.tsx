import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Layers,
    TrendingUp,
    XCircle,
    BarChart3,
    FileDown,
    Search,
} from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as pengukuranIndex } from '@/routes/pengukuran';
import { SearchableRuanganSelect } from '@/components/searchable-ruangan-select';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Stats {
    totalPengukuranHariIni: number;
    totalPengukuranBulanIni: number;
    totalMemenuhi: number;
    totalTidakMemenuhi: number;
    persentaseMemenuhi: number;
    totalRuangan: number;
    totalKategori: number;
}

interface RekapRuangan {
    id: number;
    nama_ruangan: string;
    total: number;
    memenuhi: number;
    tidak_memenuhi: number;
    persen_memenuhi: number;
}

interface TrenItem {
    tanggal: string;
    memenuhi: number;
    tidak_memenuhi: number;
    total: number;
}

interface PengukuranTerbaru {
    id: number;
    ruangan: string;
    kategori: string;
    satuan: string;
    value: number;
    status: string;
    waktu: string;
    tanggal: string;
}

interface AlertItem {
    id: number;
    ruangan: string;
    kategori: string;
    value: number;
    satuan: string;
    waktu: string;
    tanggal: string;
}

interface Kategori {
    id: number;
    nama_kategori: string;
    satuan: string;
}

interface GrafikData {
    data: Record<string, string | number | null>[];
    shifts: string[];
    satuan: string;
    kategori: string;
    ruangan: string;
    bulan: number;
    tahun: number;
    min_value: number | null;
    max_value: number | null;
}

interface Ruangan {
    id: number;
    nama_ruangan: string;
}

interface FilterDefault {
    ruangan_id: number;
    kategori_id: number;
    bulan: number;
    tahun: number;
}

interface Props {
    stats: Stats;
    rekapRuangan: RekapRuangan[];
    tren: TrenItem[];
    pengukuranTerbaru: PengukuranTerbaru[];
    alertTidakMemenuhi: AlertItem[];
    grafikData: GrafikData | [];
    ruangans: Ruangan[];
    kategoris: Kategori[];
    filterDefault: FilterDefault;
}

// ── Constants ──────────────────────────────────────────────────────────────
const SHIFT_LABEL: Record<string, string> = {
    pagi: '🌅 Pagi',
    siang: '☀️ Siang',
    malam: '🌙 Malam',
};

const MONTHS = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

// Fixed colors for 3 shifts
const SHIFT_COLORS: Record<string, string> = {
    pagi:  '#f59e0b',  // amber
    siang: '#3b82f6',  // blue
    malam: '#8b5cf6',  // violet
};

const SHIFT_LABELS: Record<string, string> = {
    pagi:  '🌅 Pagi',
    siang: '☀️ Siang',
    malam: '🌙 Malam',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function StatCard({
    icon: Icon, label, value, sub, iconBg, iconColor,
}: {
    icon: React.ElementType; label: string; value: string | number;
    sub?: string; iconBg: string; iconColor: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

// ── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard({
    stats, rekapRuangan, tren, pengukuranTerbaru,
    alertTidakMemenuhi, grafikData: initialGrafik, ruangans, kategoris, filterDefault,
}: Props) {
    const maxTren = Math.max(...tren.map((t) => t.total), 1);

    // ── Chart filter state ─────────────────────────────────────────────
    const [filter, setFilter] = useState({
        ruangan_id:  filterDefault.ruangan_id.toString(),
        kategori_id: filterDefault.kategori_id.toString(),
        bulan:       filterDefault.bulan.toString(),
        tahun:       filterDefault.tahun.toString(),
    });
    const [grafik, setGrafik] = useState<GrafikData | null>(
        Array.isArray(initialGrafik) ? null : initialGrafik
    );
    const [loading, setLoading] = useState(false);
    const [searchRekap, setSearchRekap] = useState('');

    const filteredRekap = useMemo(() => {
        if (!searchRekap) return rekapRuangan;
        return rekapRuangan.filter(r => 
            r.nama_ruangan.toLowerCase().includes(searchRekap.toLowerCase())
        );
    }, [rekapRuangan, searchRekap]);

    const handlePrintQuickReport = () => {
        const params = new URLSearchParams();
        params.append('ruangan_ids[]', filter.ruangan_id);
        params.append('kategori_id', filter.kategori_id);
        params.append('bulan', filter.bulan);
        params.append('tahun', filter.tahun);
        
        window.open(`/report/download?${params.toString()}`, '_blank');
    };

    const fetchGrafik = useCallback(async (f: typeof filter) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ruangan_id:  f.ruangan_id,
                kategori_id: f.kategori_id,
                bulan:       f.bulan,
                tahun:       f.tahun,
            });
            const res = await fetch(`/dashboard/grafik?${params.toString()}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            setGrafik(json);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGrafik(filter);
    }, [filter]);

    return (
        <>
            <Head title="Dashboard — Kesling Monitor" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto pb-10">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dashboard Kesling</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Monitoring kesehatan lingkungan rumah sakit
                        </p>
                    </div>
                    <Link
                        href={pengukuranIndex.url()}
                        className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                        Lihat Semua Data <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* ── Alert Banner ───────────────────────────────────── */}
                {alertTidakMemenuhi.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-semibold text-red-700">
                                {alertTidakMemenuhi.length} parameter tidak memenuhi standar (3 hari terakhir)
                            </p>
                        </div>
                        <div className="space-y-2">
                            {alertTidakMemenuhi.map((a) => (
                                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-white px-3 py-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                        <span className="font-medium text-slate-700">{a.ruangan}</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground">{a.kategori}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-semibold text-red-600">{a.value} {a.satuan}</span>
                                        <span>·</span>
                                        <span>{SHIFT_LABEL[a.waktu] ?? a.waktu}</span>
                                        <span>·</span>
                                        <span>{a.tanggal}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Stat Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard icon={ClipboardList} label="Pengukuran Hari Ini"
                        value={stats.totalPengukuranHariIni} sub="entri tercatat" iconBg="bg-blue-50" iconColor="text-blue-600" />
                    <StatCard icon={Activity} label="Bulan Ini"
                        value={stats.totalPengukuranBulanIni} sub="total pengukuran" iconBg="bg-indigo-50" iconColor="text-indigo-600" />
                    <StatCard icon={CheckCircle2} label="Memenuhi"
                        value={`${stats.totalMemenuhi} (${stats.persentaseMemenuhi}%)`} sub="bulan ini" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                    <StatCard icon={XCircle} label="Tidak Memenuhi"
                        value={stats.totalTidakMemenuhi} sub="bulan ini" iconBg="bg-red-50" iconColor="text-red-500" />
                </div>

                {/* ── Grafik Tren Harian ─────────────────────────────── */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    {/* Header + Filters */}
                    <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <BarChart3 className="h-4 w-4 text-primary shrink-0" />
                            <h2 className="text-sm font-semibold">Rata-rata Harian per Shift</h2>
                            {grafik && (
                                <span className="text-xs text-muted-foreground truncate">
                                    — <strong>{grafik.ruangan}</strong>
                                    {' · '}{grafik.kategori}{grafik.satuan ? ` (${grafik.satuan})` : ''}
                                    {', '}{MONTHS.find((m) => m.value === parseInt(filter.bulan))?.label} {filter.tahun}
                                    {grafik.min_value != null && grafik.max_value != null && (
                                        <span className="ml-1 text-muted-foreground/60">
                                            [Standar: {grafik.min_value}–{grafik.max_value} {grafik.satuan}]
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={handlePrintQuickReport}
                                disabled={!grafik}
                            >
                                <FileDown className="h-3.5 w-3.5" />
                                Cetak PDF
                            </Button>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                            {/* Ruangan */}
                            <div className="w-52">
                                <SearchableRuanganSelect
                                    ruangans={ruangans}
                                    value={filter.ruangan_id}
                                    onValueChange={(v) => setFilter((f) => ({ ...f, ruangan_id: v }))}
                                    placeholder="Cari ruangan..."
                                />
                            </div>

                            {/* Kategori */}
                            <Select
                                value={filter.kategori_id}
                                onValueChange={(v) => setFilter((f) => ({ ...f, kategori_id: v }))}
                            >
                                <SelectTrigger className="h-8 w-44 text-xs">
                                    <SelectValue placeholder="Pilih parameter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategoris.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()} className="text-xs">
                                            {k.nama_kategori} {k.satuan ? `(${k.satuan})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Bulan */}
                            <Select
                                value={filter.bulan}
                                onValueChange={(v) => setFilter((f) => ({ ...f, bulan: v }))}
                            >
                                <SelectTrigger className="h-8 w-32 text-xs">
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value.toString()} className="text-xs">
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Tahun */}
                            <Select
                                value={filter.tahun}
                                onValueChange={(v) => setFilter((f) => ({ ...f, tahun: v }))}
                            >
                                <SelectTrigger className="h-8 w-24 text-xs">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => (
                                        <SelectItem key={y} value={y.toString()} className="text-xs">
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                    {/* Chart Body */}
                    <div className="p-5">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                                <Activity className="h-5 w-5 animate-spin mr-2" />
                                Memuat data grafik...
                            </div>
                        ) : !grafik || grafik.data.length === 0 || !grafik.shifts?.length ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                                <BarChart3 className="h-10 w-10 opacity-20" strokeWidth={1} />
                                <p className="text-sm">Belum ada data untuk filter ini</p>
                                <p className="text-xs opacity-60">Pilih ruangan, parameter, bulan, dan tahun</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart
                                    data={grafik.data}
                                    margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Tanggal', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                        tickLine={false}
                                        axisLine={false}
                                        unit={grafik.satuan ? ` ${grafik.satuan}` : ''}
                                        width={64}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            fontSize: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            background: 'hsl(var(--card))',
                                            color: 'hsl(var(--foreground))',
                                        }}
                                        formatter={(value, name) =>
                                            value != null
                                                ? [`${value} ${grafik!.satuan}`, SHIFT_LABELS[String(name)] ?? String(name)]
                                                : ['—', SHIFT_LABELS[String(name)] ?? String(name)]
                                        }
                                        labelFormatter={(label) => `Tanggal ${label}`}
                                    />
                                    <Legend
                                        formatter={(value) => SHIFT_LABELS[value] ?? value}
                                        wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                                    />
                                    {/* Garis standar min */}
                                    {grafik.min_value != null && (
                                        <Line
                                            dataKey={() => grafik!.min_value}
                                            stroke="#ef4444"
                                            strokeWidth={1}
                                            strokeDasharray="6 3"
                                            dot={false}
                                            name="Min Standar"
                                            legendType="none"
                                            isAnimationActive={false}
                                        />
                                    )}
                                    {/* Garis standar max */}
                                    {grafik.max_value != null && (
                                        <Line
                                            dataKey={() => grafik!.max_value}
                                            stroke="#ef4444"
                                            strokeWidth={1}
                                            strokeDasharray="6 3"
                                            dot={false}
                                            name="Max Standar"
                                            legendType="none"
                                            isAnimationActive={false}
                                        />
                                    )}
                                    {/* Garis per shift */}
                                    {grafik.shifts.map((shift) => (
                                        <Line
                                            key={shift}
                                            type="monotone"
                                            dataKey={shift}
                                            name={shift}
                                            stroke={SHIFT_COLORS[shift] ?? '#94a3b8'}
                                            strokeWidth={2.5}
                                            dot={{ r: 3, strokeWidth: 0, fill: SHIFT_COLORS[shift] ?? '#94a3b8' }}
                                            activeDot={{ r: 5 }}
                                            connectNulls={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Row: Tren 7 Hari + Rekap Ruangan ──────────────── */}
                <div className="grid gap-4 lg:grid-cols-5">
                    {/* Tren 7 Hari */}
                    <div className="lg:col-span-3 rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold">Tren Pengukuran — 7 Hari Terakhir</h2>
                        </div>
                        <div className="flex items-end gap-2 h-36">
                            {tren.map((t, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '112px' }}>
                                        {t.total > 0 ? (
                                            <>
                                                <div className="w-full rounded-sm bg-red-400 transition-all duration-300"
                                                    style={{ height: `${(t.tidak_memenuhi / maxTren) * 104}px` }}
                                                    title={`Tidak memenuhi: ${t.tidak_memenuhi}`} />
                                                <div className="w-full rounded-sm bg-emerald-400 transition-all duration-300"
                                                    style={{ height: `${(t.memenuhi / maxTren) * 104}px` }}
                                                    title={`Memenuhi: ${t.memenuhi}`} />
                                            </>
                                        ) : (
                                            <div className="w-full rounded-sm bg-muted" style={{ height: '4px' }} />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{t.tanggal}</span>
                                    {t.total > 0 && <span className="text-[10px] font-semibold text-foreground">{t.total}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400 inline-block" /> Memenuhi
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="h-2.5 w-2.5 rounded-sm bg-red-400 inline-block" /> Tidak Memenuhi
                            </div>
                        </div>
                    </div>

                    {/* Rekap Ruangan */}
                    <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold">Status per Ruangan</h2>
                            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                {rekapRuangan.length} Ruangan
                            </span>
                        </div>

                        {/* Search Ruangan Rekap */}
                        <div className="relative mb-4">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input 
                                placeholder="Cari status ruangan..."
                                className="h-8 pl-8 text-xs bg-muted/30 border-none focus-visible:ring-1"
                                value={searchRekap}
                                onChange={(e) => setSearchRekap(e.target.value)}
                            />
                        </div>

                        {rekapRuangan.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-8">Belum ada data</p>
                        ) : (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                {filteredRekap.length > 0 ? (
                                    filteredRekap.map((r) => (
                                        <div key={r.id} className="group transition-all duration-200">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-medium truncate max-w-[65%] group-hover:text-primary transition-colors">
                                                    {r.nama_ruangan}
                                                </span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-[10px] text-emerald-600 font-semibold">{r.memenuhi}✓</span>
                                                    {r.tidak_memenuhi > 0 && (
                                                        <span className="text-[10px] text-red-500 font-semibold">{r.tidak_memenuhi}✗</span>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground font-medium">{r.persen_memenuhi}%</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                                <div className={`h-full rounded-full transition-all duration-700 ${
                                                    r.persen_memenuhi >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                                    : r.persen_memenuhi >= 50 ? 'bg-amber-400'
                                                    : 'bg-red-400'
                                                }`} style={{ width: `${r.persen_memenuhi}%` }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                        <Search className="h-8 w-8 opacity-10" />
                                        Data ruangan "{searchRekap}" tidak tersedia
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex gap-3 mt-4 pt-3 border-t">
                            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1.5 flex-1">
                                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                <div>
                                    <p className="text-[10px] text-blue-600">Ruangan</p>
                                    <p className="text-sm font-bold text-blue-700">{stats.totalRuangan}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-2.5 py-1.5 flex-1">
                                <Layers className="h-3.5 w-3.5 text-violet-500" />
                                <div>
                                    <p className="text-[10px] text-violet-600">Parameter</p>
                                    <p className="text-sm font-bold text-violet-700">{stats.totalKategori}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tabel Pengukuran Terbaru ───────────────────────── */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold">Pengukuran Terbaru</h2>
                        </div>
                        <Link href={pengukuranIndex.url()} className="text-xs text-primary hover:underline flex items-center gap-1">
                            Lihat semua <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                    {pengukuranTerbaru.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ClipboardList className="h-10 w-10 mb-2 opacity-20" strokeWidth={1} />
                            <p className="text-sm">Belum ada data pengukuran</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                                        <th className="px-4 py-3 text-left font-medium">Ruangan</th>
                                        <th className="px-4 py-3 text-left font-medium">Parameter</th>
                                        <th className="px-4 py-3 text-left font-medium">Nilai</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Shift</th>
                                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {pengukuranTerbaru.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium">{p.ruangan}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.kategori}</td>
                                            <td className="px-4 py-3 font-semibold">
                                                {p.value} <span className="text-xs font-normal text-muted-foreground">{p.satuan}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.status === 'memenuhi' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                        <CheckCircle2 className="h-3 w-3" /> Memenuhi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                                                        <XCircle className="h-3 w-3" /> Tidak Memenuhi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground capitalize">
                                                {SHIFT_LABEL[p.waktu] ?? p.waktu}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.tanggal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
    ],
};
