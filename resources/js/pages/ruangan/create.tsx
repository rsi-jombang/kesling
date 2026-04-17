import { Head, Link, useForm } from "@inertiajs/react";
import { create, index, store } from "@/routes/ruangan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/heading";

interface Kategori {
    id: number;
    nama_kategori: string;
    satuan: string | null;
}

interface Props {
    kategoris: Kategori[];
}

interface Standar {
    kategori_id: string;
    min_value: string;
    max_value: string;
}

export default function Create({kategoris}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nama_ruangan: '',
        nama_kasi: '',
        standarts: [] as Standar[],
    });

    const addStandard = () => {
        setData('standarts', [...data.standarts, { kategori_id: '', min_value: '', max_value: '' }]);
    };

    const removeStandard = (index: number) => {
        const newStandarts = [...data.standarts];
        newStandarts.splice(index, 1);
        setData('standarts', newStandarts);
    };

    const updateStandard = (index: number, field: keyof Standar, value: string) => {
        const newStandarts = [...data.standarts];
        newStandarts[index] = { ...newStandarts[index], [field]: value };
        setData('standarts', newStandarts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <>
            <Head title="Tambah Ruangan" />

            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={index()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Heading
                            title="Tambah Ruangan Baru"
                            description="Masukkan nama ruangan dan tentukan standar parameternya."
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-4 shadow-sm">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_ruangan" className="text-base font-semibold">Nama Ruangan</Label>
                                <Input
                                    id="nama_ruangan"
                                    value={data.nama_ruangan}
                                    onChange={(e) => setData('nama_ruangan', e.target.value)}
                                    placeholder="Contoh: Kamar Bedah 01"
                                    className="w-full"
                                />
                                {errors.nama_ruangan && (
                                    <p className="text-sm text-destructive">{errors.nama_ruangan}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama_kasi" className="text-base font-semibold">Nama Kasi Ruangan</Label>
                                <Input
                                    id="nama_kasi"
                                    value={data.nama_kasi}
                                    onChange={(e) => setData('nama_kasi', e.target.value)}
                                    placeholder="Nama Kepala Seksi Ruangan"
                                    className="w-full"
                                />
                                {errors.nama_kasi && (
                                    <p className="text-sm text-destructive">{errors.nama_kasi}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">Standar Pengukuran</h3>
                                <p className="text-sm text-muted-foreground">Tentukan ambang batas minimal dan maksimal di ruangan ini.</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addStandard} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Parameter
                            </Button>
                        </div>

                        {data.standarts.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                <p className="text-sm text-muted-foreground">Belum ada standar yang ditambahkan.</p>
                                <Button type="button" variant="link" onClick={addStandard}>Mulai tambahkan standar sekarang</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.standarts.map((item, index) => (
                                    <div key={index} className="flex flex-col md:flex-row md:items-end gap-3 p-4 rounded-lg border bg-muted/5 relative group transition-colors hover:bg-muted/10">
                                        <div className="grid gap-2 w-full md:flex-1">
                                            <Label className="md:hidden lg:block">Parameter (Kategori)</Label>
                                            <Label className="hidden md:block lg:hidden">Parameter</Label>
                                            <Select
                                                value={item.kategori_id}
                                                onValueChange={(val) => updateStandard(index, 'kategori_id', val)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {kategoris.map((kat) => (
                                                        <SelectItem key={kat.id} value={kat.id.toString()}>
                                                            {kat.nama_kategori} {kat.satuan ? `(${kat.satuan})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`standarts.${index}.kategori_id` as any] && (
                                                <p className="text-xs text-destructive">{errors[`standarts.${index}.kategori_id` as any]}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
                                            <div className="grid gap-2 flex-1 md:w-[120px]">
                                                <Label>Min Value</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={item.min_value}
                                                    onChange={(e) => updateStandard(index, 'min_value', e.target.value)}
                                                    placeholder="Min"
                                                />
                                            </div>

                                            <div className="grid gap-2 flex-1 md:w-[120px]">
                                                <Label>Max Value</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={item.max_value}
                                                    onChange={(e) => updateStandard(index, 'max_value', e.target.value)}
                                                    placeholder="Max"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-9 w-9 md:h-10 md:w-10 mt-2 md:mt-0 self-end md:self-auto border md:border-none hover:bg-destructive/10 shrink-0"
                                            onClick={() => removeStandard(index)}
                                            title="Hapus Parameter"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Hapus</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end pt-4">
                        <Button disabled={processing} size="lg" className="w-full sm:w-auto px-8">
                            <Save className="mr-2 h-5 w-5" />
                            Simpan Ruangan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Ruangan',
            href: index.url(),
        },
        {
            title: 'Tambah Ruangan',
            href: create.url(),
        },
    ],
};
