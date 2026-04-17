import { Head, Link, router } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Search, User as UserIcon } from "lucide-react";
import Heading from "@/components/heading";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    created_at: string;
}

interface IndexProps {
    data: {
        data: User[];
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/users',
            { search: search },
            { preserveState: true, replace: true }
        );
    }

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            router.delete(`/users/${id}`);
        }
    }

    return (
        <>
            <Head title="Manajemen User" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen User"
                        description="Kelola daftar pengguna aplikasi dan hak aksesnya."
                    />
                    <Link href="/users/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau email..."
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
                                router.get('/users', {}, { replace: true });
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
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tanggal Dibuat</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Belum ada data user
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-primary/10 p-1.5 rounded-full">
                                                    <UserIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                {item.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.role === 'admin' ? 'pagi' : 'outline'} className="capitalize border-blue-200">
                                                {item.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link href={`/users/${item.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id)}
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
        { title: 'Manajemen User' },
    ],
};
