import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/heading";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

interface Props {
    user: User;
}

export default function Edit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <>
            <Head title="Edit User" />

            <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto pb-20">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href="/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Heading
                        title="Edit User"
                        description="Perbarui informasi akun dan hak akses pengguna."
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@email.com"
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User / Petugas</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">{errors.role}</p>
                            )}
                        </div>

                        <div className="pt-4 border-t space-y-4">
                            <div className="bg-muted/50 p-3 rounded-md mb-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Keamanan</p>
                                <p className="text-xs text-muted-foreground">Kosongkan password jika tidak ingin mengubahnya.</p>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password Baru</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Isi hanya jika ingin ganti password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled={processing} size="lg" className="px-8">
                            <Save className="mr-2 h-5 w-5" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Manajemen User', href: '/users' },
        { title: 'Edit User' },
    ],
};
