import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/heading';
import { index, update } from '@/routes/pengukuran';
import { SearchableRuanganSelect } from '@/components/searchable-ruangan-select';

interface KategoriPengukuran {
    id: number;
    nama_kategori: string;
    satuan: string;
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

interface Pengukuran {
    id: number;
    ruangan_id: number;
    kategori_pengukuran_id: number;
    value: number;
    status: string;
    waktu_pengukuran: string;
    tanggal_pengukuran: string;
    keterangan: string | null;
    ruangan: { nama_ruangan: string };
    kategori_pengukuran: KategoriPengukuran;
}

interface Props {
    pengukuran: Pengukuran;
    ruangans: Ruangan[];
}

const SHIFT_META: Record<string, { label: string; icon: string }> = {
    pagi:  { label: 'Pagi',  icon: '🌅' },
    siang: { label: 'Siang', icon: '☀️'  },
    malam: { label: 'Malam', icon: '🌙' },
};

export default function Edit({ pengukuran, ruangans }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        ruangan_id:             pengukuran.ruangan_id.toString(),
        kategori_pengukuran_id: pengukuran.kategori_pengukuran_id.toString(),
        tanggal_pengukuran:     pengukuran.tanggal_pengukuran,
        waktu_pengukuran:       pengukuran.waktu_pengukuran,
        value:                  pengukuran.value.toString(),
        keterangan:             pengukuran.keterangan ?? '',
    });

    // Derive selected room's standards for the current room
    const selectedRuangan = ruangans.find((r) => r.id === parseInt(data.ruangan_id)) ?? null;

    // Determine min/max for currently selected category
    const selectedStandart = selectedRuangan?.standarts.find(
        (s) => s.kategori_pengukuran_id === parseInt(data.kategori_pengukuran_id)
    );
    const allKategoris = selectedRuangan?.standarts ?? [];

    // Live validation feedback
    const numVal = parseFloat(data.value);
    const v1 = selectedStandart?.min_value != null ? parseFloat(selectedStandart.min_value as string) : null;
    const v2 = selectedStandart?.max_value != null ? parseFloat(selectedStandart.max_value as string) : null;

    // Normalisasi: Pastikan min adalah nilai terkecil dan max adalah nilai terbesar
    const min = (v1 !== null && v2 !== null) ? Math.min(v1, v2) : (v1 ?? null);
    const max = (v1 !== null && v2 !== null) ? Math.max(v1, v2) : (v2 ?? null);

    const isFilled = data.value !== '' && !isNaN(numVal);
    const isOk  = isFilled && (min === null || numVal >= min) && (max === null || numVal <= max);
    const isNok = isFilled && !isOk;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(update.url(pengukuran.id));
    };

    return (
        <>
            <Head title={`Edit Pengukuran #${pengukuran.id}`} />

            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-16">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={index.url()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title="Edit Pengukuran"
                        description={`Memperbarui data pengukuran — ${pengukuran.ruangan.nama_ruangan}`}
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Informasi Pengukuran ───────────────────── */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Informasi Pengukuran
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
                                onValueChange={(v) => {
                                    setData((prev) => ({
                                        ...prev,
                                        ruangan_id: v,
                                        kategori_pengukuran_id: '',
                                    }));
                                }}
                                error={!!errors.ruangan_id}
                            />
                            {errors.ruangan_id && <p className="text-xs text-destructive">{errors.ruangan_id}</p>}
                        </div>

                        {/* Kategori */}
                        <div className="space-y-1.5">
                            <Label htmlFor="kategori_id" className="text-sm font-medium">
                                Parameter / Kategori <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                onValueChange={(v) => setData('kategori_pengukuran_id', v)}
                                value={data.kategori_pengukuran_id}
                                disabled={allKategoris.length === 0}
                            >
                                <SelectTrigger id="kategori_id" className={`h-10 w-full ${errors.kategori_pengukuran_id ? 'border-destructive' : ''}`}>
                                    <SelectValue placeholder={allKategoris.length === 0 ? 'Pilih ruangan dulu...' : 'Pilih parameter...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {allKategoris.map((s) => (
                                        <SelectItem key={s.id} value={s.kategori_pengukuran_id.toString()}>
                                            {s.kategori.nama_kategori} ({s.kategori.satuan})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.kategori_pengukuran_id && <p className="text-xs text-destructive">{errors.kategori_pengukuran_id}</p>}
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
                                    <SelectTrigger id="waktu" className={`h-10 w-full ${errors.waktu_pengukuran ? 'border-destructive' : ''}`}>
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

                        {/* Value */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="value" className="text-sm font-medium">
                                    Nilai <span className="text-destructive">*</span>
                                </Label>
                                {selectedStandart && (
                                    <span className="text-[11px] text-muted-foreground">
                                        Standar: {selectedStandart.min_value ?? '∞'} – {selectedStandart.max_value ?? '∞'}{' '}
                                        <span className="font-medium">{selectedStandart.kategori.satuan}</span>
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.01"
                                    id="value"
                                    placeholder="0.00"
                                    value={data.value}
                                    onChange={(e) => setData('value', e.target.value)}
                                    className={`h-10 w-full pr-16 ${
                                        isNok ? 'border-destructive'
                                        : isOk ? 'border-emerald-400'
                                        : errors.value ? 'border-destructive'
                                        : ''
                                    }`}
                                />
                                {selectedStandart && (
                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-muted-foreground">
                                        {selectedStandart.kategori.satuan}
                                    </span>
                                )}
                            </div>
                            {/* Live feedback */}
                            {isOk && (
                                <p className="text-xs text-emerald-600 font-medium">✓ Nilai memenuhi standar</p>
                            )}
                            {isNok && (
                                <p className="text-xs text-destructive font-medium">
                                    ✗ Nilai di luar batas standar ({min ?? '∞'} – {max ?? '∞'})
                                </p>
                            )}
                            {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
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

                    {/* Status preview */}
                    {isFilled && (
                        <div className={`rounded-xl border p-4 text-sm font-medium flex items-center gap-2 ${
                            isOk
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <span>{isOk ? '✓' : '✗'}</span>
                            <span>Status akan tersimpan sebagai: <strong>{isOk ? 'Memenuhi' : 'Tidak Memenuhi'}</strong></span>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="w-full sm:w-auto px-8"
                        >
                            {processing ? (
                                <>Menyimpan...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Daftar Pengukuran', href: index.url() },
        { title: 'Edit Pengukuran' },
    ],
};
