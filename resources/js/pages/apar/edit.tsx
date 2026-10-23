import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heading from '@/components/heading';
import { ArrowLeft, Save } from 'lucide-react';

interface Ruangan {
    id: number;
    nama_ruangan: string;
}

interface Unit {
    id: number;
    ruangan_id: number;
    nomor_seri: string;
    jenis: string | null;
    kapasitas: string | null;
    tanggal_kadaluarsa: string | null;
    keterangan: string | null;
}

interface Props {
    unit: Unit;
    ruangans: Ruangan[];
}

export default function AparEdit({ unit, ruangans }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        ruangan_id: unit.ruangan_id.toString(),
        nomor_seri: unit.nomor_seri,
        jenis: unit.jenis ?? '',
        kapasitas: unit.kapasitas ?? '',
        tanggal_kadaluarsa: unit.tanggal_kadaluarsa ?? '',
        keterangan: unit.keterangan ?? '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/apar/${unit.id}`);
    };

    return (
        <>
            <Head title="Edit Unit APAR" />
            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-16">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href="/apar">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading title="Edit Unit APAR" description="Perbarui data unit APAR." />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
                    <div className="space-y-1.5">
                        <Label>Ruangan *</Label>
                        <Select value={data.ruangan_id} onValueChange={(v) => setData('ruangan_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Pilih ruangan..." /></SelectTrigger>
                            <SelectContent>
                                {ruangans.map((r) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>{r.nama_ruangan}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.ruangan_id && <p className="text-xs text-destructive">{errors.ruangan_id}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Nomor Seri *</Label>
                        <Input value={data.nomor_seri} onChange={(e) => setData('nomor_seri', e.target.value)} />
                        {errors.nomor_seri && <p className="text-xs text-destructive">{errors.nomor_seri}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Jenis</Label>
                            <Input value={data.jenis} onChange={(e) => setData('jenis', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Kapasitas</Label>
                            <Input value={data.kapasitas} onChange={(e) => setData('kapasitas', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Tanggal Kadaluarsa</Label>
                        <Input type="date" value={data.tanggal_kadaluarsa} onChange={(e) => setData('tanggal_kadaluarsa', e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Keterangan</Label>
                        <Input value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" /> Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AparEdit.layout = {
    breadcrumbs: [
        { title: 'Inventaris APAR', href: '/apar' },
        { title: 'Edit Unit' },
    ],
};