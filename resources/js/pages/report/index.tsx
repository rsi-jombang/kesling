import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FileDown, BarChart3, Building2, Layers, Calendar, Check, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { download } from '@/routes/report';
import { cn } from '@/lib/utils';

interface Ruangan { id: number; nama_ruangan: string; }
interface Kategori { 
    id: number; 
    nama_kategori: string; 
    satuan: string; 
    standarts?: { kategori_pengukuran_id: number; ruangan_id: number; }[];
}

interface Props {
    ruangans: Ruangan[];
    kategoris: Kategori[];
}

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

export default function ReportIndex({ ruangans, kategoris }: Props) {
    const [selectedRuanganIds, setSelectedRuanganIds] = useState<number[]>([]);
    const [searchRuangan, setSearchRuangan] = useState('');
    const [form, setForm] = useState({
        kategori_id: '',
        bulan:       String(new Date().getMonth() + 1),
        tahun:       String(currentYear),
    });

    // Ambil daftar ruangan yang valid untuk kategori terpilih
    const validRuanganIdsForKategori = useMemo(() => {
        if (!form.kategori_id) return [];
        const kat = kategoris.find(k => k.id.toString() === form.kategori_id);
        return kat?.standarts?.map(s => s.ruangan_id) || [];
    }, [form.kategori_id, kategoris]);

    const filteredRuangans = useMemo(() => {
        // Filter berdasarkan kategori dulu
        let base = ruangans.filter(r => validRuanganIdsForKategori.includes(r.id));
        
        // Baru filter berdasarkan pencarian
        if (searchRuangan) {
            base = base.filter(r => r.nama_ruangan.toLowerCase().includes(searchRuangan.toLowerCase()));
        }
        return base;
    }, [ruangans, validRuanganIdsForKategori, searchRuangan]);

    const isValid = selectedRuanganIds.length > 0 && form.kategori_id && form.bulan && form.tahun;

    const handleKategoriChange = (v: string) => {
        setForm(f => ({ ...f, kategori_id: v }));
        setSelectedRuanganIds([]); // Reset pilihan ruangan saat kategori berubah
        setSearchRuangan('');
    };

    const handleToggleRuangan = (id: number) => {
        setSelectedRuanganIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRuanganIds.length === filteredRuangans.length) {
            setSelectedRuanganIds([]);
        } else {
            setSelectedRuanganIds(filteredRuangans.map(r => r.id));
        }
    };

    const handleDownload = () => {
        if (!isValid) return;
        
        const params = new URLSearchParams();
        selectedRuanganIds.forEach(id => params.append('ruangan_ids[]', id.toString()));
        params.append('kategori_id', form.kategori_id);
        params.append('bulan', form.bulan);
        params.append('tahun', form.tahun);

        window.open(`${download.url()}?${params.toString()}`, '_blank');
    };

    const selectedKategori = kategoris.find(k => k.id.toString() === form.kategori_id);
    const selectedBulan    = MONTHS.find(m => m.value.toString() === form.bulan);

    return (
        <>
            <Head title="Download Laporan — Kesling" />

            <div className="flex flex-col items-center justify-start min-h-screen p-6 md:p-10">
                <div className="w-full max-w-2xl">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3">
                            <BarChart3 className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Laporan Monitoring Kesling</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pilih Parameter terlebih dahulu untuk menampilkan daftar ruangan
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-6">

                        {/* Kategori (Sekarang di paling atas) */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                Parameter Pengukuran
                            </label>
                            <Select
                                value={form.kategori_id}
                                onValueChange={handleKategoriChange}
                            >
                                <SelectTrigger className="w-full bg-primary/5 border-primary/20 h-11">
                                    <SelectValue placeholder="Pilih parameter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategoris.map(k => (
                                        <SelectItem key={k.id} value={k.id.toString()}>
                                            {k.nama_kategori} {k.satuan ? `(${k.satuan})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ruangan (Multi-Select) - Hanya muncul jika kategori sudah dipilih */}
                        <div className={cn(
                            "space-y-3 transition-all duration-300",
                            !form.kategori_id ? "opacity-40 pointer-events-none grayscale" : "opacity-100"
                        )}>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Pilih Ruangan ({selectedRuanganIds.length})
                                </label>
                                {form.kategori_id && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2 text-xs text-primary"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedRuanganIds.length === filteredRuangans.length && filteredRuangans.length > 0 ? 'Hapus Semua' : 'Pilih Semua'}
                                    </Button>
                                )}
                            </div>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={form.kategori_id ? "Cari ruangan..." : "Pilih parameter terlebih dahulu..."}
                                    className="pl-9 h-9"
                                    value={searchRuangan}
                                    onChange={(e) => setSearchRuangan(e.target.value)}
                                    disabled={!form.kategori_id}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-muted/20">
                                {!form.kategori_id ? (
                                    <div className="col-span-full py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                                        <Layers className="h-8 w-8 opacity-20" />
                                        Silakan pilih parameter terlebih dahulu
                                    </div>
                                ) : filteredRuangans.length > 0 ? (
                                    filteredRuangans.map((r) => (
                                        <div 
                                            key={r.id}
                                            onClick={() => handleToggleRuangan(r.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors border",
                                                selectedRuanganIds.includes(r.id) 
                                                    ? "bg-primary/10 border-primary/20" 
                                                    : "bg-card border-transparent hover:bg-muted"
                                            )}
                                        >
                                            <Checkbox 
                                                checked={selectedRuanganIds.includes(r.id)}
                                                onCheckedChange={() => handleToggleRuangan(r.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-sm truncate font-medium">
                                                {r.nama_ruangan}
                                            </span>
                                            {selectedRuanganIds.includes(r.id) && (
                                                <Check className="ml-auto h-3 w-3 text-primary" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-10 text-center text-xs text-muted-foreground">
                                        Tidak ada ruangan yang dipantau untuk parameter ini...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bulan & Tahun */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Bulan
                                </label>
                                <Select
                                    value={form.bulan}
                                    onValueChange={(v) => setForm(f => ({ ...f, bulan: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value.toString()}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium block">Tahun</label>
                                <Select
                                    value={form.tahun}
                                    onValueChange={(v) => setForm(f => ({ ...f, tahun: v }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YEARS.map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Preview info */}
                        {isValid && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                                <p className="font-medium text-primary mb-0.5">Preview laporan yang akan diunduh:</p>
                                <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">{selectedRuanganIds.length} Ruangan terpilih</span>
                                    {' — '}
                                    <span className="font-medium text-foreground">{selectedKategori?.nama_kategori}</span>
                                    {selectedKategori?.satuan ? ` (${selectedKategori.satuan})` : ''}
                                    {' · '}
                                    <span className="font-medium text-foreground">{selectedBulan?.label} {form.tahun}</span>
                                </p>
                            </div>
                        )}

                        {/* Download Button */}
                        <Button
                            onClick={handleDownload}
                            disabled={!isValid}
                            className={cn(
                                "w-full h-11 text-sm font-semibold gap-2 transition-all duration-500",
                                isValid ? "shadow-lg shadow-primary/20" : ""
                            )}
                            size="lg"
                        >
                            <FileDown className="h-5 w-5" />
                            Unduh Laporan PDF ({selectedRuanganIds.length} Hal)
                        </Button>

                        {!isValid && (
                            <p className="text-center text-xs text-muted-foreground">
                                {!form.kategori_id ? "Pilih parameter pengukuran terlebih dahulu" : "Pilih minimal satu ruangan untuk mengunduh"}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ReportIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan' },
    ],
};
