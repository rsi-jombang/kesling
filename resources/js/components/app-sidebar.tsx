import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, FolderGit2, Layers, LayoutGrid, MapPin, Ruler, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as ruangan } from '@/routes/ruangan';
import { index as kategori } from '@/routes/kategori';
import { index as pengukuran } from '@/routes/pengukuran';
import { index as report } from '@/routes/report';
import type { NavItem, Auth } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<Auth>().props;
    const isAdmin = auth.user?.role === 'admin';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Kategori Pengukuran',
            href: kategori(),
            icon: Layers,
        },
        {
            title: 'Ruangan',
            href: ruangan(),
            icon: MapPin,
        },
        {
            title: 'Pengukuran',
            href: pengukuran(),
            icon: Ruler,
        },
        {
            title: 'Laporan',
            href: report(),
            icon: FileText,
        },
        // Only show if admin
        ...(isAdmin ? [
            {
                title: 'Manajemen User',
                href: '/users',
                icon: Users,
            }
        ] : [])
    ];

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
