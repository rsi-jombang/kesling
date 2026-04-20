import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Info } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { store, update, destroy } from '@/routes/kategori';
import {Auth} from '@/types';

interface Kategori {
    id: number;
    nama_kategori: string;
    slug: string;
    satuan: string | null;
    tipe_data: string;
    keterangan: string | null;
    is_public: boolean;
    analisa_memenuhi: string | null;
    analisa_tidak_memenuhi: string | null;
    analisa_melebihi_standart: string | null;
}

interface Props {
    kategoris: Kategori[];
}

export default function Index({ kategoris }: Props) {
    const {auth} = usePage<Auth>().props;
    const isAdmin = auth.user?.role === "admin";
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_kategori: '',
        satuan: '',
        tipe_data: 'numeric',
        is_public: false,
        keterangan: '',
        analisa_memenuhi: '',
        analisa_tidak_memenuhi: '',
        analisa_melebihi_standart: '',
    });

    const openCreateDialog = () => {
        setEditingKategori(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (kategori: Kategori) => {
        setEditingKategori(kategori);
        setData({
            nama_kategori: kategori.nama_kategori,
            satuan: kategori.satuan || '',
            tipe_data: kategori.tipe_data,
            is_public: !!kategori.is_public,
            keterangan: kategori.keterangan || '',
            analisa_memenuhi: kategori.analisa_memenuhi || '',
            analisa_tidak_memenuhi: kategori.analisa_tidak_memenuhi || '',
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingKategori) {
            put(update.url(editingKategori.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.delete(destroy.url(id));
        }
    };

    return (
        <>
            <Head title="Master Kategori Pengukuran" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Master Kategori"
                        description="Kelola jenis parameter pengukuran (Suhu, Kelembaban, dll)."
                    />
                    <Button onClick={openCreateDialog} disabled={!isAdmin}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Kategori</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead>Tipe Data</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kategoris.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Data kategori belum tersedia.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                kategoris.map((kategori) => (
                                    <TableRow key={kategori.id}>
                                        <TableCell className="font-medium">
                                            {kategori.nama_kategori}
                                            {kategori.keterangan && (
                                                <p className="text-xs text-muted-foreground mt-1">{kategori.keterangan}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>{kategori.satuan || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Badge variant="secondary" className="capitalize">
                                                    {kategori.tipe_data.replace('_', ' ')}
                                                </Badge>
                                                {kategori.is_public ? (
                                                    <Badge variant="default" className="text-[10px] bg-blue-500 hover:bg-blue-600">Publik</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px]">Privat</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => openEditDialog(kategori)}
                                                    disabled={!isAdmin}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(kategori.id)}
                                                    disabled={!isAdmin}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_kategori">Nama Kategori</Label>
                                <Input
                                    id="nama_kategori"
                                    value={data.nama_kategori}
                                    onChange={(e) => setData('nama_kategori', e.target.value)}
                                    placeholder="Contoh: Suhu, Kelembaban"
                                />
                                {errors.nama_kategori && (
                                    <p className="text-sm text-destructive">{errors.nama_kategori}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="satuan">Satuan (Unit)</Label>
                                <Input
                                    id="satuan"
                                    value={data.satuan}
                                    onChange={(e) => setData('satuan', e.target.value)}
                                    placeholder="Contoh: °C, %, Lux, dB"
                                />
                                {errors.satuan && (
                                    <p className="text-sm text-destructive">{errors.satuan}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tipe_data">Tipe Data</Label>
                                <Select
                                    value={data.tipe_data}
                                    onValueChange={(value) => setData('tipe_data', value)}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Pilih tipe data" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="numeric">Numeric (Angka)</SelectItem>
                                        <SelectItem value="string">String (Teks)</SelectItem>
                                        <SelectItem value="boolean">Boolean (Ya/Tidak)</SelectItem>
                                        <SelectItem value="checklist_apar">Checklist APAR Bulanan</SelectItem>
                                        <SelectItem value="rumus_ach">Rumus ACH (Laju Udara)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.tipe_data && (
                                    <p className="text-sm text-destructive">{errors.tipe_data}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2 cursor-pointer border p-3 rounded-md hover:bg-secondary/20">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        checked={data.is_public}
                                        onChange={(e) => setData('is_public', e.target.checked)} />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">Akses Publik (Tanpa Login)</span>
                                        <span className="text-xs text-muted-foreground w-full font-normal">Kategori ini bisa diisi orang umum via scan QR/Link Publik.</span>
                                    </div>
                                </Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Input
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Opsional"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <Alert className="mb-4 bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-800 font-semibold">Petunjuk Analisa Laporan</AlertTitle>
                                    <AlertDescription className="text-blue-700 text-xs mt-1">
                                        Gunakan variabel berikut untuk membuat kalimat otomatis:
                                        <ul className="list-disc list-inside mt-1 font-mono">
                                            <li>{"{ruangan}"} : Nama ruangan</li>
                                            <li>{"{kategori}"} : Nama parameter (Suhu, dll)</li>
                                            <li>{"{rata_rata}"} : Nilai rata-rata bulanan</li>
                                            <li>{"{satuan}"} : Satuan nilai</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="analisa_memenuhi" className="text-emerald-700">Analisa (Jika Memenuhi Standar)</Label>
                                        <Textarea
                                            id="analisa_memenuhi"
                                            value={data.analisa_memenuhi}
                                            onChange={(e) => setData('analisa_memenuhi', e.target.value)}
                                            placeholder="Contoh: Analisa hasil {kategori} di {ruangan} rata-rata {rata_rata} {satuan} sudah memenuhi standar."
                                            className="min-h-[100px]"
                                        />
                                        {errors.analisa_memenuhi && (
                                            <p className="text-sm text-destructive">{errors.analisa_memenuhi}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="analisa_tidak_memenuhi" className="text-red-700">Analisa (Jika TIDAK Memenuhi)</Label>
                                        <Textarea
                                            id="analisa_tidak_memenuhi"
                                            value={data.analisa_tidak_memenuhi}
                                            onChange={(e) => setData('analisa_tidak_memenuhi', e.target.value)}
                                            placeholder="Contoh: Analisa hasil {kategori} di {ruangan} rata-rata {rata_rata} {satuan} belum memenuhi standar. Perlu evaluasi AC."
                                            className="min-h-[100px]"
                                        />
                                        {errors.analisa_tidak_memenuhi && (
                                            <p className="text-sm text-destructive">{errors.analisa_tidak_memenuhi}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="analisa_melebihi_standart" className="text-yellow-700">Analisa (Jika Melebihi Standart)</Label>
                                        <Textarea
                                            id="analisa_melebihi_standart"
                                            value={data.analisa_melebihi_standart}
                                            onChange={(e) => setData('analisa_melebihi_standart', e.target.value)}
                                            placeholder="Contoh: Analisa hasil {kategori} di {ruangan} rata-rata {rata_rata} {satuan} belum memenuhi standar. Perlu evaluasi AC."
                                            className="min-h-[100px]"
                                        />
                                        {errors.analisa_melebihi_standart && (
                                            <p className="text-sm text-destructive">{errors.analisa_melebihi_standart}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    title: "Kategori Pengukuran",
    description: "Daftar kategori pengukuran yang digunakan dalam sistem.",
}
