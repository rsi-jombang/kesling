import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Save, Thermometer, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/heading';
import { index, store } from '@/routes/pengukuran';
import { SearchableRuanganSelect } from '@/components/searchable-ruangan-select';

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
}

const SHIFT_META: Record<string, { label: string; icon: string }> = {
    pagi:  { label: 'Pagi',  icon: '🌅' },
    siang: { label: 'Siang', icon: '☀️'  },
    malam: { label: 'Malam', icon: '🌙' },
};

export default function Create({ ruangans }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        ruangan_id: '',
        tanggal_pengukuran: '',
        waktu_pengukuran: '',
        measurements: {} as Record<number, any>,
        keterangan: '',
    });

    const [selectedRuangan, setSelectedRuangan] = useState<Ruangan | null>(null);
    const [focusedField, setFocusedField] = useState<number | null>(null);

    useEffect(() => {
        if (data.ruangan_id) {
            const ruangan = ruangans.find((r) => r.id === parseInt(data.ruangan_id));
            if (ruangan) {
                setSelectedRuangan(ruangan);
                const init: Record<number, any> = {};
                ruangan.standarts.forEach((s) => {
                    if (s.kategori?.tipe_data === 'checklist_apar') {
                        init[s.kategori_pengukuran_id] = {};
                    } else {
                        init[s.kategori_pengukuran_id] = '';
                    }
                });
                setData('measurements', init);
            }
        } else {
            setSelectedRuangan(null);
            setData('measurements', {});
        }
    }, [data.ruangan_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const filledCount = selectedRuangan
        ? selectedRuangan.standarts.filter((s) => {
            const val = data.measurements[s.kategori_pengukuran_id];
            if (s.kategori?.tipe_data === 'checklist_apar') {
                return val && Object.keys(val).length === 6; // 6 items to check
            }
            return !!val;
        }).length
        : 0;
    const totalCount = selectedRuangan?.standarts.length ?? 0;
    const progress = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

    return (
        <>
            <Head title="Tambah Pengukuran" />

            <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto pb-16">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={index.url()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title="Tambah Pengukuran"
                        description="Isi parameter pengukuran untuk satu sesi (ruangan & shift)."
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Informasi Sesi ─────────────────────────── */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Informasi Sesi
                        </h3>

                        {/* Ruangan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="ruangan_id" className="text-sm font-medium">
                                Nama Ruangan <span className="text-destructive">*</span>
                            </Label>
                            <SearchableRuanganSelect
                                id="ruangan_id"
                                ruangans={ruangans}
                                value={data.ruangan_id}
                                onValueChange={(v) => setData('ruangan_id', v)}
                                error={!!errors.ruangan_id}
                            />
                            {errors.ruangan_id && <p className="text-xs text-destructive">{errors.ruangan_id}</p>}
                        </div>

                        {/* Tanggal + Shift */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="tanggal" className="text-sm font-medium">
                                    Tanggal <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    id="tanggal"
                                    value={data.tanggal_pengukuran}
                                    onChange={(e) => setData('tanggal_pengukuran', e.target.value)}
                                    className={`h-10 w-full ${errors.tanggal_pengukuran ? 'border-destructive' : ''}`}
                                />
                                {errors.tanggal_pengukuran && <p className="text-xs text-destructive">{errors.tanggal_pengukuran}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="waktu" className="text-sm font-medium">
                                    Shift Waktu <span className="text-destructive">*</span>
                                </Label>
                                <Select onValueChange={(v) => setData('waktu_pengukuran', v)} value={data.waktu_pengukuran}>
                                    <SelectTrigger
                                        id="waktu"
                                        className={`h-10 w-full ${errors.waktu_pengukuran ? 'border-destructive' : ''}`}
                                    >
                                        <SelectValue placeholder="Pilih shift..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SHIFT_META).map(([key, m]) => (
                                            <SelectItem key={key} value={key}>
                                                {m.icon} {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.waktu_pengukuran && <p className="text-xs text-destructive">{errors.waktu_pengukuran}</p>}
                            </div>
                        </div>

                        {/* Keterangan */}
                        <div className="space-y-1.5">
                            <Label htmlFor="keterangan" className="text-sm font-medium">
                                Keterangan <span className="text-muted-foreground text-xs">(opsional)</span>
                            </Label>
                            <Input
                                id="keterangan"
                                placeholder="Catatan tambahan..."
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                className="h-10 w-full"
                            />
                        </div>
                    </div>

                    {/* ── Parameter Pengukuran ───────────────────── */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Parameter Pengukuran
                            </h3>
                            {selectedRuangan && (
                                <span className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-primary">{selectedRuangan.nama_ruangan}</span>
                                    {' · '}{filledCount}/{totalCount} terisi
                                </span>
                            )}
                        </div>

                        {selectedRuangan ? (
                            <>
                                {/* Progress */}
                                {totalCount > 0 && (
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {selectedRuangan.standarts.map((std) => {
                                        const type   = std.kategori.tipe_data;
                                        const val    = data.measurements[std.kategori_pengukuran_id];
                                        const numVal = typeof val === 'string' || typeof val === 'number' ? parseFloat(val as string) : NaN;
                                        const v1     = std.min_value != null ? parseFloat(std.min_value as string) : null;
                                        const v2     = std.max_value != null ? parseFloat(std.max_value as string) : null;

                                        // Normalisasi: Pastikan min adalah nilai terkecil dan max adalah nilai terbesar
                                        const min = (v1 !== null && v2 !== null) ? Math.min(v1, v2) : (v1 ?? null);
                                        const max = (v1 !== null && v2 !== null) ? Math.max(v1, v2) : (v2 ?? null);

                                        let filled = false;
                                        let ok = false;

                                        if (type === 'checklist_apar') {
                                            filled = val && Object.keys(val).length === 6;
                                            ok = filled && Object.values(val).every(v => v === 'baik');
                                        } else {
                                            filled = val !== '' && !isNaN(numVal) && val !== undefined;
                                            // Untuk ACH, kita belum tahu hasil volume, jadi kita bypass checklist visual sementara atau biarkan aktif
                                            if (type === 'rumus_ach') {
                                                ok = filled; // TBD logic
                                            } else {
                                                ok = filled && (min === null || numVal >= min) && (max === null || numVal <= max);
                                            }
                                        }

                                        const nok    = filled && !ok;

                                        return (
                                            <div
                                                key={std.id}
                                                className={`rounded-lg border p-3.5 transition-all duration-150 ${
                                                    focusedField === std.id ? 'border-primary/40 bg-primary/5'
                                                    : nok ? 'border-destructive/30 bg-destructive/5'
                                                    : ok ? 'border-emerald-300 bg-emerald-50'
                                                    : 'border-border bg-muted/30 hover:border-primary/20'
                                                }`}
                                            >
                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`flex h-6 w-6 items-center justify-center rounded-md ${ok ? 'bg-emerald-100' : nok ? 'bg-red-100' : 'bg-primary/10'}`}>
                                                            <Thermometer className={`h-3.5 w-3.5 ${ok ? 'text-emerald-600' : nok ? 'text-destructive' : 'text-primary'}`} strokeWidth={1.5} />
                                                        </div>
                                                        <span className="text-sm font-semibold">{std.kategori.nama_kategori}</span>
                                                        {type === 'rumus_ach' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Hitung Otomatis (ACH)</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {ok && (
                                                            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                <CheckCircle2 className="h-2.5 w-2.5" /> {type === 'checklist_apar' ? 'Semua Baik' : 'Memenuhi'}
                                                            </span>
                                                        )}
                                                        {nok && (
                                                            <span className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                                                                <XCircle className="h-2.5 w-2.5" /> {type === 'checklist_apar' ? 'Ada Kerusakan' : 'Di Luar Batas'}
                                                            </span>
                                                        )}
                                                        {type !== 'checklist_apar' && type !== 'rumus_ach' && (
                                                            <span className="rounded-md border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                                                                {std.min_value ?? '∞'}–{std.max_value ?? '∞'} <span className="font-medium">{std.kategori.satuan}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="relative mt-3">
                                                    {type === 'checklist_apar' ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-white p-3 rounded-md border">
                                                            {['Pressure Gauge', 'Pin / Segel', 'Selang', 'Klem Selang', 'Handle', 'Kondisi Fisik'].map((item) => {
                                                                const key = item.replace(/ /g, '_').replace(/\//g, '').toLowerCase();
                                                                return (
                                                                    <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0 sm:nth-last-2:border-0">
                                                                        <span className="text-muted-foreground">{item}</span>
                                                                        <div className="flex gap-4 items-center">
                                                                            <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition-colors">
                                                                                <input type="radio" className="peer w-4 h-4 text-emerald-600" name={`${std.id}_${key}`} checked={val?.[key] === 'baik'} onChange={() => setData('measurements', {...data.measurements, [std.kategori_pengukuran_id]: {...(val||{}), [key]: 'baik'} })} />
                                                                                <span className="font-medium peer-checked:text-emerald-700">V (Baik)</span>
                                                                            </label>
                                                                            <label className="flex items-center gap-1.5 cursor-pointer hover:text-destructive transition-colors">
                                                                                <input type="radio" className="peer w-4 h-4 text-destructive" name={`${std.id}_${key}`} checked={val?.[key] === 'rusak'} onChange={() => setData('measurements', {...data.measurements, [std.kategori_pengukuran_id]: {...(val||{}), [key]: 'rusak'} })} />
                                                                                <span className="font-medium peer-checked:text-destructive">X (Rusak)</span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {type === 'rumus_ach' && <Label className="text-xs text-muted-foreground mb-1 block">Input Laju Udara AC / Kipas Angin (m/s)</Label>}
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                placeholder={type === 'rumus_ach' ? "Contoh: 0.8" : "0.00"}
                                                                onFocus={() => setFocusedField(std.id)}
                                                                onBlur={() => setFocusedField(null)}
                                                                className={`h-10 pr-14 ${nok ? 'border-destructive' : ok ? 'border-emerald-400' : ''}`}
                                                                value={val ?? ''}
                                                                onChange={(e) => {
                                                                    setData('measurements', {
                                                                        ...data.measurements,
                                                                        [std.kategori_pengukuran_id]: e.target.value,
                                                                    });
                                                                }}
                                                            />
                                                            <span className="pointer-events-none absolute bottom-3 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                                                                {type === 'rumus_ach' ? '' : std.kategori.satuan}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted py-10 text-center">
                                <Thermometer className="mb-2 h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
                                <p className="text-sm font-medium text-muted-foreground">Pilih ruangan terlebih dahulu</p>
                                <p className="mt-1 text-xs text-muted-foreground/60">Parameter akan muncul secara otomatis</p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing || !selectedRuangan || !data.waktu_pengukuran}
                            size="lg"
                            className="w-full sm:w-auto px-8"
                        >
                            {processing ? (
                                <>Menyimpan...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Pengukuran
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Daftar Pengukuran', href: index.url() },
        { title: 'Tambah Pengukuran' },
    ],
};
