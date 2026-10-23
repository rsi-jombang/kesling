import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Heading from '@/components/heading';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface AparUnit {
    id: number;
    slug: string;
    nomor_seri: string;
    jenis: string | null;
    kapasitas: string | null;
    tanggal_kadaluarsa: string | null;
    ruangan?: { nama_ruangan: string };
}

interface Props {
    units: {
        data: AparUnit[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function AparIndex({ units }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Hapus unit APAR ini?')) {
            router.delete(`/apar/${id}`);
        }
    };

    return (
        <>
            <Head title="Inventaris APAR" />
            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto pb-16">
                <div className="flex items-center justify-between">
                    <Heading title="Inventaris APAR" description="Daftar unit APAR per ruangan." />
                    <Button asChild>
                        <Link href="/apar/create">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Unit
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Nomor Seri</th>
                                <th className="px-4 py-3 text-left font-medium">Jenis</th>
                                <th className="px-4 py-3 text-left font-medium">Kapasitas</th>
                                <th className="px-4 py-3 text-left font-medium">Ruangan</th>
                                <th className="px-4 py-3 text-left font-medium">Kadaluarsa</th>
                                <th className="px-4 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {units.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        Belum ada unit APAR.
                                    </td>
                                </tr>
                            ) : (
                                units.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium">{u.nomor_seri}</td>
                                        <td className="px-4 py-3">{u.jenis ?? '-'}</td>
                                        <td className="px-4 py-3">{u.kapasitas ?? '-'}</td>
                                        <td className="px-4 py-3">{u.ruangan?.nama_ruangan ?? '-'}</td>
                                        <td className="px-4 py-3">{u.tanggal_kadaluarsa ?? '-'}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/apar/${u.id}/edit`}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {units.links.length > 3 && (
                    <div className="flex gap-2 justify-center">
                        {units.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AparIndex.layout = {
    breadcrumbs: [{ title: 'Inventaris APAR' }],
};