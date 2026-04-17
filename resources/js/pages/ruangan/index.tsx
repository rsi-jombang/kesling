import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus, Pencil, Trash2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { create, destroy, edit, index as indexRoute } from '@/routes/ruangan';
import { Auth } from "@/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagination";

interface Ruangan {
    id: number;
    nama_ruangan: string;
    nama_kasi: string | null;
    pengukurans_count: number;
}

interface IndexProps {
    data: {
        data: Ruangan[];
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
    const { auth } = usePage<Auth>().props;
    const isAdmin = auth.user?.role === "admin";
    const [search, setSearch] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            indexRoute.url({ query: { search: search } }),
            {},
            { preserveState: true, replace: true }
        );
    }

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus ruangan ini? Semua data pengukuran yang terkait dengan ruangan ini akan ikut terhapus.')) {
            router.delete(destroy.url({ id }));
        }
    }

    return (
        <>
            <Head title="Daftar Ruangan" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Daftar Ruangan"
                        description="Kelola daftar ruangan dan standar parameter pengukurannya."
                    />
                    <Link href={create.url()}>
                        <Button disabled={!isAdmin}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Ruangan
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama ruangan (Tekan Enter)..."
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
                                router.get(indexRoute.url(), {}, { replace: true });
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
                                <TableHead>Nama Ruangan</TableHead>
                                <TableHead>Kasi Ruangan</TableHead>
                                <TableHead className="text-center">Total Pengukuran</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        Belum ada data ruangan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((ruangan) => (
                                    <TableRow key={ruangan.id}>
                                        <TableCell className="font-medium text-base">
                                            {ruangan.nama_ruangan}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground italic">
                                            {ruangan.nama_kasi || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="px-3 py-1 text-sm">
                                                {ruangan.pengukurans_count}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="icon" disabled={!isAdmin}>
                                                    <Link href={edit.url(ruangan.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    disabled={!isAdmin}
                                                    onClick={() => handleDelete(ruangan.id)}>
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
                    <p className="text-sm text-muted-foreground font-medium">
                        Menampilkan <span className="text-foreground">{data.data.length}</span> dari <span className="text-foreground">{data.total}</span> ruangan
                    </p>
                    <Pagination links={data.links} />
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: "Daftar Ruangan",
            description: "Kelola daftar ruangan dan standar parameter pengukurannya.",
            icon: MapPin,
        }
    ]
};
