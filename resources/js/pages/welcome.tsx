import FlashToaster from '@/components/flashtoaster';
import { Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import {
    Activity,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Loader2,
    Thermometer,
    XCircle,
    Sun,
    Sunrise,
    Moon,
    Waves,
    Microscope,
    ShieldCheck,
    ArrowRight,
    Monitor,
    MousePointer2,
    Info,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SearchableRuanganSelect } from '@/components/searchable-ruangan-select';
import { store } from '@/actions/App/Http/Controllers/Public/PublicPengukuranController';
import {
    BarChart3,
    FileDown,
    TrendingUp,
    Search,
    LineChart as ChartIcon,
    Table as TableIcon
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

interface KategoriPengukuran {
    id: number;
    nama_kategori: string;
    satuan: string;
    tipe_data: string;
}

interface StandartPengukuran {
    id: number;
    kategori_pengukuran_id: number;
    min_value: string | number | null;
    max_value: string | number | null;
    kategori: KategoriPengukuran;
}

interface Ruangan {
    id: number;
    nama_ruangan: string;
    standarts: StandartPengukuran[];
}

interface Props {
    ruangans: Ruangan[];
    kategoris: any[];
    dateDefaults: {
        bulan: number;
        tahun: number;
    };
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

const SHIFT_OPTIONS = [
    { id: 'pagi', label: 'Pagi', icon: Sunrise, description: '07:00 - 14:00', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', activeText: 'text-amber-700 dark:text-amber-300' },
    { id: 'siang', label: 'Siang', icon: Sun, description: '14:00 - 21:00', bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-800', activeText: 'text-sky-700 dark:text-sky-300' },
    { id: 'malam', label: 'Malam', icon: Moon, description: '21:00 - 07:00', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', activeText: 'text-indigo-700 dark:text-indigo-300' },
];

export default function Welcome({ ruangans, kategoris, dateDefaults }: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const getCurrentDateTime = () => new Date().toLocaleString('sv-SE').replace(' ', 'T').substring(0, 16);

    const { data, setData, post, processing, errors, reset } = useForm({
        ruangan_id: '',
        tanggal_pengukuran: getCurrentDateTime(),
        waktu_pengukuran: '',
        measurements: {} as Record<number, string | number>,
    });

    const [selectedRuangan, setSelectedRuangan] = useState<Ruangan | null>(null);
    const [focusedField, setFocusedField] = useState<number | null>(null);

    // ── Public Report State ─────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'input' | 'report'>('input');
    const [chartFilter, setChartFilter] = useState({
        ruangan_ids: [ruangans[0]?.id.toString()].filter(Boolean) as string[],
        kategori_id: kategoris[0]?.id.toString() || '',
        bulan:       dateDefaults.bulan.toString(),
        tahun:       dateDefaults.tahun.toString(),
    });
    const [searchRuanganText, setSearchRuanganText] = useState('');
    const [grafik, setGrafik] = useState<GrafikData | null>(null);
    const [loadingChart, setLoadingChart] = useState(false);

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

    const MONTHS = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
        { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
        { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
        { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
        { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
    ];

    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchGrafik = async () => {
        // Find the first room ID from selection for chart
        const firstRuanganId = chartFilter.ruangan_ids[0];
        if (!firstRuanganId || !chartFilter.kategori_id) return;

        setLoadingChart(true);
        try {
            const params = new URLSearchParams({
                ruangan_id:  firstRuanganId,
                kategori_id: chartFilter.kategori_id,
                bulan:       chartFilter.bulan,
                tahun:       chartFilter.tahun,
            });
            const res = await fetch(`/public/grafik?${params.toString()}`);
            const json = await res.json();
            setGrafik(json);
        } catch (error) {
            console.error('Failed to fetch chart data');
        } finally {
            setLoadingChart(false);
        }
    };

    const handleDownloadPdf = () => {
        if (chartFilter.ruangan_ids.length === 0) return;
        const params = new URLSearchParams();
        chartFilter.ruangan_ids.forEach(id => params.append('ruangan_ids[]', id));
        params.append('kategori_id', chartFilter.kategori_id);
        params.append('bulan', chartFilter.bulan);
        params.append('tahun', chartFilter.tahun);

        window.open(`/public/report/download?${params.toString()}`, '_blank');
    };

    useEffect(() => {
        if (activeTab === 'report') {
            fetchGrafik();
        }
    }, [chartFilter.ruangan_ids[0], chartFilter.kategori_id, chartFilter.bulan, chartFilter.tahun, activeTab]);

    useEffect(() => {
        if (data.ruangan_id) {
            const ruangan = ruangans.find((r) => r.id === parseInt(data.ruangan_id));
            if (ruangan) {
                setSelectedRuangan(ruangan);
                const init: Record<number, string> = {};
                ruangan.standarts.forEach((s) => { init[s.kategori_pengukuran_id] = ''; });
                setData('measurements', init);
            }
        } else {
            setSelectedRuangan(null);
        }
    }, [data.ruangan_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: () => {
                reset('measurements');
            },
        });
    };

    const filledCount = selectedRuangan
        ? selectedRuangan.standarts.filter((s) => {
              const v = data.measurements[s.kategori_pengukuran_id];
              return v !== '' && v !== undefined;
          }).length
        : 0;
    const totalCount = selectedRuangan?.standarts.length ?? 0;
    const progress = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

    const dateFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-x-hidden">
            <Head title="Monitoring Kesling Hospital" />
            <Toaster position="top-right" richColors />
            <FlashToaster />

            {/* Background Decor */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30 dark:opacity-20 transition-opacity">
                <div className="absolute -top-[10%] -right-[5%] h-[40rem] w-[40rem] rounded-full bg-blue-400/20 blur-[100px] animate-pulse" />
                <div className="absolute -bottom-[20%] left-[10%] h-[50rem] w-[50rem] rounded-full bg-indigo-400/10 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <p className="text-sm font-black tracking-tight uppercase italic">Kesling Monitor</p>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Intelligence System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-blue-200/50 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 px-4 py-2 ring-1 ring-white/50 dark:ring-transparent backdrop-blur-sm shadow-sm">
                            <div className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </div>
                            <span className="text-[12px] font-bold tracking-wide text-blue-700 dark:text-blue-400 uppercase">{dateFormatted}</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                <DropdownMenuItem onClick={() => updateAppearance('light')} className="gap-2 focus:bg-blue-600 focus:text-white rounded-lg cursor-pointer">
                                    <Sun className="h-4 w-4" /> Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('dark')} className="gap-2 focus:bg-blue-600 focus:text-white rounded-lg cursor-pointer">
                                    <Moon className="h-4 w-4" /> Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('system')} className="gap-2 focus:bg-blue-600 focus:text-white rounded-lg cursor-pointer">
                                    <Monitor className="h-4 w-4" /> System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 md:py-16">
                {/* Hero */}
                <div className="mb-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Monitoring Kesehatan Lingkungan
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-6xl italic">
                        {activeTab === 'input' ? 'Input Data' : 'Grafik & Laporan'} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent underline decoration-blue-500/30 decoration-8 underline-offset-4">{activeTab === 'input' ? 'Harian' : 'Bulanan'}</span>
                    </h1>
                </div>

                {/* Tab Switcher */}
                <div className="mb-12 flex justify-center p-1">
                    <div className="inline-flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-700/50 shadow-inner">
                        <button
                            onClick={() => setActiveTab('input')}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-sm font-black italic transition-all duration-300",
                                activeTab === 'input'
                                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] opacity-100"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 opacity-60"
                            )}
                        >
                            <Activity className={cn("h-4 w-4", activeTab === 'input' ? "text-blue-600" : "")} />
                            INPUT DATA
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] text-sm font-black italic transition-all duration-300",
                                activeTab === 'report'
                                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] opacity-100"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 opacity-60"
                            )}
                        >
                            <ChartIcon className={cn("h-4 w-4", activeTab === 'report' ? "text-indigo-600" : "")} />
                            GRAFIK & LAPORAN
                        </button>
                    </div>
                </div>

                {activeTab === 'input' ? (
                    <>
                        {/* Info Section - Now Above the Form */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group rounded-3xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-5 backdrop-blur-md shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Microscope className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-tight">Standar Akreditasi</h3>
                        </div>
                        <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                            Monitoring harian untuk pemenuhan standar manajemen risiko lingkungan rumah sakit.
                        </p>
                    </div>

                    <div className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 backdrop-blur-md shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                <Info className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-tight">Petunjuk Pengisian</h3>
                        </div>
                        <p className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                            Pilih ruangan terlebih dahulu, sesuaikan waktu, lalu isi semua parameter yang muncul.
                        </p>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="relative overflow-hidden rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-blue-900/5 transition-all">
                    {selectedRuangan && (
                        <div className="absolute top-0 h-1.5 w-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                    )}

                    <div className="px-8 md:px-12 pt-12 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black tracking-tight italic uppercase">Formulir Pencatatan</h2>
                            {selectedRuangan && (
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                                    LENGKAP: {progress}%
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500">Pastikan data yang dimasukkan akurat sesuai hasil alat ukur.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 md:px-12 pb-12 space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white italic">01</div>
                                <h3 className="text-sm font-black uppercase tracking-widest">Waktu & Lokasi</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Room Select */}
                                <div className="space-y-2">
                                    <Label htmlFor="ruangan_id" className="text-xs font-bold uppercase tracking-wider text-slate-400">Pilih Ruangan</Label>
                                    <SearchableRuanganSelect
                                        ruangans={ruangans}
                                        value={data.ruangan_id}
                                        onValueChange={(v) => setData('ruangan_id', v)}
                                        placeholder="Cari & pilih ruangan..."
                                        className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-5 font-semibold focus:ring-4 focus:ring-blue-500/10 transition-all hover:bg-white dark:hover:bg-slate-900"
                                    />
                                    {errors.ruangan_id && <p className="text-[10px] font-bold text-red-500 uppercase px-2">{errors.ruangan_id}</p>}
                                </div>

                                {/* DateTime Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal" className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                        Waktu Pengukuran
                                        <button type="button" onClick={() => setData('tanggal_pengukuran', getCurrentDateTime())} className="text-[9px] text-blue-500 hover:text-blue-600 font-black italic underline flex items-center gap-1">
                                            <MousePointer2 className="h-2 w-2" /> Waktu Sekarang
                                        </button>
                                    </Label>
                                    <Input
                                        type="datetime-local"
                                        id="tanggal"
                                        value={data.tanggal_pengukuran}
                                        onChange={(e) => setData('tanggal_pengukuran', e.target.value)}
                                        className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 font-black focus:ring-4 focus:ring-blue-500/10 transition-all hover:bg-white dark:hover:bg-slate-900 outline-none"
                                    />
                                    {errors.tanggal_pengukuran && <p className="text-[10px] font-bold text-red-500 uppercase px-2">{errors.tanggal_pengukuran}</p>}
                                </div>
                            </div>

                            {/* Shift Toggle */}
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Shift Petugas</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    {SHIFT_OPTIONS.map((shift) => (
                                        <button
                                            key={shift.id}
                                            type="button"
                                            onClick={() => setData('waktu_pengukuran', shift.id)}
                                            className={cn(
                                                "group relative flex flex-col items-center justify-center gap-1.5 h-[6rem] rounded-[24px] border-2 transition-all duration-300",
                                                data.waktu_pengukuran === shift.id
                                                    ? `${shift.bg} ${shift.border} scale-[1.02] shadow-xl shadow-blue-500/5`
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-700"
                                            )}
                                        >
                                            <shift.icon className={cn("h-7 w-7 mb-1 transition-transform group-hover:rotate-12", data.waktu_pengukuran === shift.id ? shift.activeText : "text-slate-400")} />
                                            <span className={cn("text-[11px] font-black uppercase tracking-tight", data.waktu_pengukuran === shift.id ? shift.activeText : "text-slate-500")}>
                                                {shift.label}
                                            </span>
                                            {data.waktu_pengukuran === shift.id && (
                                                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                                    <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {errors.waktu_pengukuran && <p className="text-[10px] font-bold text-red-500 uppercase px-2">{errors.waktu_pengukuran}</p>}
                            </div>
                        </div>

                        {/* Step 2: Parameters */}
                        <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white italic">02</div>
                                    <h3 className="text-sm font-black uppercase tracking-widest">Parameter Lingkungan</h3>
                                </div>
                                {selectedRuangan && (
                                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Sesuai Ruangan: {selectedRuangan.nama_ruangan}
                                    </div>
                                )}
                            </div>

                            {selectedRuangan ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedRuangan.standarts.map((std) => {
                                        const val    = data.measurements[std.kategori_pengukuran_id];
                                        const numVal = parseFloat(val as string);
                                        const v1     = std.min_value != null ? parseFloat(std.min_value as string) : null;
                                        const v2     = std.max_value != null ? parseFloat(std.max_value as string) : null;

                                        // Normalisasi: pastikan min adalah nilai terkecil dan max adalah nilai terbesar
                                        const min    = (v1 !== null && v2 !== null) ? Math.min(v1, v2) : (v1 ?? null);
                                        const max    = (v1 !== null && v2 !== null) ? Math.max(v1, v2) : (v2 ?? null);

                                        const filled = val !== '' && val !== undefined && !isNaN(numVal);
                                        const ok     = filled && (min === null || numVal >= min) && (max === null || numVal <= max);
                                        const nok    = filled && !ok;

                                        return (
                                            <div key={std.id} className={cn(
                                                "relative rounded-[28px] border-2 p-6 transition-all duration-300",
                                                focusedField === std.id ? "border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-xl scale-[1.01]" :
                                                nok ? "border-red-400 bg-red-50/30 dark:bg-red-950/20" :
                                                ok ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20"
                                            )}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm", ok ? "bg-emerald-500 text-white" : nok ? "bg-red-500 text-white" : "bg-blue-600 text-white")}>
                                                            <Thermometer className="h-4.5 w-4.5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{std.kategori.nama_kategori}</p>
                                                            <p className="text-[11px] font-bold">Standard: <span className="italic opacity-80">{std.min_value ?? '∞'} – {std.max_value ?? '∞'}</span></p>
                                                        </div>
                                                    </div>
                                                    {ok && <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={3} />}
                                                    {nok && <XCircle className="h-5 w-5 text-red-500" strokeWidth={3} />}
                                                </div>

                                                <div className="relative">
                                                    <Input
                                                        type="number" step="0.01" placeholder="0.00"
                                                        onFocus={() => setFocusedField(std.id)} onBlur={() => setFocusedField(null)}
                                                        className={cn("h-14 w-full rounded-2xl border-none bg-white dark:bg-slate-900 px-5 pr-14 text-xl font-black shadow-inner transition-all outline-none ring-0 focus:ring-2 focus:ring-blue-500/20", ok ? "text-emerald-700 dark:text-emerald-400" : nok ? "text-red-700 dark:text-red-400" : "text-slate-900 dark:text-white")}
                                                        value={data.measurements[std.kategori_pengukuran_id] ?? ''}
                                                        onChange={(e) => setData('measurements', { ...data.measurements, [std.kategori_pengukuran_id]: e.target.value })}
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">{std.kategori.satuan}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="group relative flex flex-col items-center justify-center rounded-[40px] border-4 border-dashed border-slate-100 dark:border-slate-800/50 py-24 text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110">
                                        <Building2 className="h-12 w-12 text-slate-200 dark:text-slate-800" strokeWidth={1} />
                                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                                            <Search className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <p className="max-w-[240px] text-xl font-black tracking-tight leading-tight italic">Pilih Ruangan di Atas untuk Memulai...</p>
                                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Ready for input data</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-10">
                            <button type="submit" disabled={processing || !selectedRuangan} className={cn(
                                "group relative w-full overflow-hidden rounded-[32px] py-7 text-xl font-black italic uppercase tracking-tighter transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale",
                                processing ? "bg-slate-800" : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-[0_24px_48px_-12px_rgba(37,99,235,0.4)] hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.6)]"
                            )}>
                                <div className="absolute inset-0 bg-[linear-gradient(110deg,#ffffff15_0%,#ffffff30_50%,#ffffff15_100%)] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />
                                {processing ? (
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                ) : (
                                    <div className="flex items-center justify-center gap-5">
                                        <ShieldCheck className="h-8 w-8 transition-transform group-hover:rotate-12" />
                                        <span>Simpan Data Akurat</span>
                                        <ArrowRight className="h-8 w-8 opacity-40 transition-transform group-hover:translate-x-1" />
                                    </div>
                                )}
                            </button>
                            <p className="mt-5 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60">Professional Hospital Audit Tool</p>
                        </div>
                    </form>
                </div>
                    </>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Chart Header & Controls */}
                        <div className="rounded-[40px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                        <TrendingUp className="h-3.5 w-3.5" /> Analisis Tren
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Visualisasi Data</h2>
                                    <p className="text-xs font-medium text-slate-500">Pilih Parameter terlebih dahulu untuk menampilkan daftar ruangan.</p>
                                </div>

                                <Button
                                    onClick={handleDownloadPdf}
                                    disabled={chartFilter.ruangan_ids.length === 0 || !chartFilter.kategori_id}
                                    className="h-14 rounded-[20px] bg-slate-900 dark:bg-indigo-600 text-white font-black italic px-8 shadow-xl hover:scale-105 active:scale-95 transition-all gap-2 disabled:opacity-50"
                                >
                                    <FileDown className="h-5 w-5" />
                                    CETAK PDF ({chartFilter.ruangan_ids.length} RUANGAN)
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 pt-10 border-t border-slate-100 dark:border-slate-800/50">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Parameter</Label>
                                    <Select
                                        value={chartFilter.kategori_id}
                                        onValueChange={(v) => {
                                            setChartFilter(f => ({ ...f, kategori_id: v, ruangan_ids: [] }));
                                            setSearchRuanganText('');
                                        }}
                                    >
                                        <SelectTrigger className="h-14 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 font-bold italic px-5 overflow-hidden">
                                            <div className="truncate text-left w-full"><SelectValue /></div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                            {kategoris.map(k => (
                                                <SelectItem key={k.id} value={k.id.toString()} className="focus:bg-blue-600 focus:text-white p-3 cursor-pointer">{k.nama_kategori} ({k.satuan})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Bulan</Label>
                                    <Select
                                        value={chartFilter.bulan}
                                        onValueChange={(v) => setChartFilter(f => ({ ...f, bulan: v }))}
                                    >
                                        <SelectTrigger className="h-14 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 font-bold italic px-5">
                                            <div className="truncate text-left w-full"><SelectValue /></div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                            {MONTHS.map(m => (
                                                <SelectItem key={m.value} value={m.value.toString()} className="focus:bg-blue-600 focus:text-white p-3 cursor-pointer">{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Tahun</Label>
                                    <Select
                                        value={chartFilter.tahun}
                                        onValueChange={(v) => setChartFilter(f => ({ ...f, tahun: v }))}
                                    >
                                        <SelectTrigger className="h-14 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 font-bold italic px-5">
                                            <div className="truncate text-left w-full"><SelectValue /></div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                            {YEARS.map(y => (
                                                <SelectItem key={y} value={y.toString()} className="focus:bg-blue-600 focus:text-white p-3 cursor-pointer">{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Multiple Room Selection Card */}
                            <div className={cn(
                                "mb-10 space-y-4 rounded-3xl border-2 p-6 transition-all duration-500",
                                !chartFilter.kategori_id ? "opacity-40 grayscale pointer-events-none" : "border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-950/30"
                            )}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest italic">Pilih Ruangan : {chartFilter.ruangan_ids.length} Terpilih</h3>
                                            <p className="text-[10px] font-medium text-slate-500">Multiple ruangan akan digabung dalam satu PDF.</p>
                                        </div>
                                    </div>

                                    {chartFilter.kategori_id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const validIds = ruangans
                                                    .filter(r => r.standarts.some(s => s.kategori_pengukuran_id.toString() === chartFilter.kategori_id))
                                                    .map(r => r.id.toString());

                                                if (chartFilter.ruangan_ids.length === validIds.length && validIds.length > 0) {
                                                    setChartFilter(f => ({ ...f, ruangan_ids: [] }));
                                                } else {
                                                    setChartFilter(f => ({ ...f, ruangan_ids: validIds }));
                                                }
                                            }}
                                            className="h-8 text-[10px] font-black uppercase italic text-blue-600 hover:text-blue-700"
                                        >
                                            {chartFilter.ruangan_ids.length === ruangans.filter(r => r.standarts.some(s => s.kategori_pengukuran_id.toString() === chartFilter.kategori_id)).length && ruangans.filter(r => r.standarts.some(s => s.kategori_pengukuran_id.toString() === chartFilter.kategori_id)).length > 0 ? 'Hapus Semua' : 'Pilih Semua'}
                                        </Button>
                                    )}
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari ruangan..."
                                        value={searchRuanganText}
                                        onChange={(e) => setSearchRuanganText(e.target.value)}
                                        className="h-12 pl-11 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 scrollbar-thin">
                                    {ruangans
                                        .filter(r => {
                                            const hasStandard = r.standarts.some(s => s.kategori_pengukuran_id.toString() === chartFilter.kategori_id);
                                            const matchesSearch = r.nama_ruangan.toLowerCase().includes(searchRuanganText.toLowerCase());
                                            return hasStandard && matchesSearch;
                                        })
                                        .map(r => {
                                            const isSelected = chartFilter.ruangan_ids.includes(r.id.toString());
                                            return (
                                                <div
                                                    key={r.id}
                                                    onClick={() => {
                                                        const id = r.id.toString();
                                                        setChartFilter(f => ({
                                                            ...f,
                                                            ruangan_ids: isSelected ? f.ruangan_ids.filter(i => i !== id) : [...f.ruangan_ids, id]
                                                        }));
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border",
                                                        isSelected
                                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]"
                                                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => {}} // Controlled via parent onClick
                                                        className={cn("h-4 w-4 rounded-md border-2", isSelected ? "border-white bg-white text-blue-600" : "border-slate-200")}
                                                    />
                                                    <span className="text-xs font-black uppercase tracking-tight truncate flex-1">
                                                        {r.nama_ruangan}
                                                    </span>
                                                    {isSelected && <Check className="h-3 w-3" strokeWidth={4} />}
                                                </div>
                                            );
                                        })
                                    }
                                    {ruangans.filter(r => r.standarts.some(s => s.kategori_pengukuran_id.toString() === chartFilter.kategori_id)).length === 0 && chartFilter.kategori_id && (
                                        <div className="col-span-full py-12 text-center">
                                            <p className="text-xs font-black text-slate-400 uppercase italic">Tidak ada ruangan dengan standar ini...</p>
                                        </div>
                                    )}
                                    {!chartFilter.kategori_id && (
                                        <div className="col-span-full py-12 text-center">
                                            <p className="text-xs font-black text-slate-400 uppercase italic">Silakan pilih parameter terlebih dahulu...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="relative min-h-[400px] flex items-center justify-center rounded-[32px] bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 p-6">
                                {loadingChart ? (
                                    <div className="flex flex-col items-center gap-4 text-slate-400">
                                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                                        <p className="text-xs font-black uppercase tracking-widest italic animate-pulse">Menghitung rata-rata...</p>
                                    </div>
                                ) : !grafik || grafik.data.length === 0 ? (
                                    <div className="flex flex-col items-center gap-4 text-slate-400 grayscale opacity-40">
                                        <Activity className="h-20 w-20" strokeWidth={1} />
                                        <p className="text-sm font-black italic">Pilih minimal 1 ruangan untuk melihat grafik.</p>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <div className="flex items-center justify-between px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visualisasi Utama : <span className="text-blue-600 italic">{(ruangans.find(r => r.id.toString() === chartFilter.ruangan_ids[0])?.nama_ruangan) || ''}</span></p>
                                            </div>
                                            {chartFilter.ruangan_ids.length > 1 && (
                                                <p className="text-[9px] font-bold text-slate-400 italic">*Grafik hanya menampilkan data ruangan pertama pilihan Anda.</p>
                                            )}
                                        </div>
                                        <ResponsiveContainer width="100%" height={380}>
                                            <LineChart data={grafik.data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                                                <XAxis
                                                    dataKey="label"
                                                    axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                                                    label={{ value: 'Tanggal', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800, fill: 'currentColor', opacity: 0.5 }}
                                                />
                                                <YAxis
                                                    axisLine={false} tickLine={false}
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                                                    unit={grafik.satuan ? ` ${grafik.satuan}` : ''}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '24px',
                                                        border: 'none',
                                                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
                                                        background: 'hsl(var(--card))',
                                                        padding: '16px'
                                                    }}
                                                    labelStyle={{ fontWeight: 900, marginBottom: '8px', opacity: 0.6 }}
                                                    formatter={(value, name) => [
                                                        <span className="font-black">{value} {grafik.satuan}</span>,
                                                        <span className="text-[10px] font-bold uppercase">{SHIFT_LABELS[String(name)] ?? name}</span>
                                                    ]}
                                                />
                                                <Legend
                                                    verticalAlign="top" align="right"
                                                    iconType="circle"
                                                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{SHIFT_LABELS[value] ?? value}</span>}
                                                />

                                                {/* Standar Lines */}
                                                {grafik.min_value != null && (
                                                    <Line dataKey={() => grafik.min_value} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Min Standar" legendType="none" />
                                                )}
                                                {grafik.max_value != null && (
                                                    <Line dataKey={() => grafik.max_value} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Max Standar" legendType="none" />
                                                )}

                                                {/* Data Lines */}
                                                {grafik.shifts.map(shift => (
                                                    <Line
                                                        key={shift}
                                                        type="monotone"
                                                        dataKey={shift}
                                                        name={shift}
                                                        stroke={SHIFT_COLORS[shift]}
                                                        strokeWidth={4}
                                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: SHIFT_COLORS[shift] }}
                                                        activeDot={{ r: 7, strokeWidth: 0, shadow: '0 0 10px rgba(0,0,0,0.5)' }}
                                                        connectNulls
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Legend / Info */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
                                    <Sunrise className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase">Shift Pagi</p>
                                        <p className="text-[11px] font-medium opacity-60">07:00 - 14:00 WIB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30">
                                    <Sun className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase">Shift Siang</p>
                                        <p className="text-[11px] font-medium opacity-60">14:00 - 21:00 WIB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
                                    <Moon className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase">Shift Malam</p>
                                        <p className="text-[11px] font-medium opacity-60">21:00 - 07:00 WIB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Public Context Alert */}
                        <div className="rounded-3xl border border-blue-200/40 dark:border-blue-800/20 bg-blue-50/30 dark:bg-blue-900/10 p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-sm font-black uppercase tracking-widest text-blue-700 dark:text-blue-400 flex items-center justify-center md:justify-start gap-2">
                                    Data Publik Transparan
                                </h4>
                                <p className="text-xs font-medium text-slate-500 mt-1">Laporan ini bersifat ringkasan (rata-rata) dan tidak mencantumkan data personal petugas sesuai regulasi keamanan informasi rumah sakit.</p>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="mt-24 border-t border-slate-200/50 dark:border-slate-800/10 pt-10 pb-16 flex flex-col md:flex-row items-center justify-between gap-6 px-10 text-[11px] font-medium text-slate-400">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
                            <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic">Hospital Environmental Control System</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-60">© {new Date().getFullYear()}</span>
                        <span className="font-black text-blue-600/80">KESLING MONITOR</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                        <span className="font-bold opacity-80">v3.1.2 Professional</span>
                    </div>
                </footer>
            </main>

            <style>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .italic { font-style: italic; }
            `}</style>
        </div>
    );
}
