import { Head, Link, router, usePage } from "@inertiajs/react";
import { destroy, edit as editRoute, create, index as pengukuranIndex } from "@/routes/pengukuran";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Heading from "@/components/heading";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Auth } from "@/types";

interface Pengukuran {
    id: number;
    ruangan_id: number;
    kategori_pengukuran_id: number;
    value: number;
    status: string;
    waktu_pengukuran: string;
    tanggal_pengukuran: string;
    keterangan: string;
    ruangan: {
        nama_ruangan: string;
    };
    kategori_pengukuran: {
        nama_kategori: string;
        satuan: string;
    };
}

interface IndexProps {
    data: {
        data: Pengukuran[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function Index({ data, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || "");
    const {auth} = usePage<Auth>().props;
    const isAdmin = auth.user?.role === "admin";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            pengukuranIndex.url({ query: { search: search } }),
            {},
            { preserveState: true, replace: true }
        );
    }

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data pengukuran ini?')) {
            router.delete(destroy.url({ id }));
        }
    }

    return (
        <>
            <Head title="Daftar Pengukuran" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Daftar Pengukuran"
                        description="Kelola daftar pengukuran dan standar parameter pengukurannya."
                    />
                    <Link href={create.url()}>
                        <Button disabled={!isAdmin}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Pengukuran
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari ruangan atau kategori (Tekan Enter)..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    {search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch("");
                                router.get(pengukuranIndex.url(), {}, { replace: true });
                            }}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ruangan</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Nilai</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24">
                                        Belum ada data pengukuran
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.ruangan.nama_ruangan}
                                        </TableCell>
                                        <TableCell>
                                            {item.kategori_pengukuran.nama_kategori}
                                        </TableCell>
                                        <TableCell>
                                            {item.value} {item.kategori_pengukuran.satuan}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === 'memenuhi' ? 'default' : 'destructive'} className="capitalize">
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.tanggal_pengukuran}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            <Badge variant={item.waktu_pengukuran === 'pagi' ? 'pagi' : item.waktu_pengukuran === 'siang' ? 'siang' : 'malam'} className="capitalize">
                                                {item.waktu_pengukuran}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {item.keterangan || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={!isAdmin}
                                                >
                                                    <Link href={editRoute.url(item.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id)}
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

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {data.data.length} dari {data.total} data
                    </p>
                    <Pagination links={data.links} />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Daftar Pengukuran' },
    ],
};
