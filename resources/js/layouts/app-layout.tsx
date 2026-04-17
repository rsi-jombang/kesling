import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import FlashToaster from '@/components/flashtoaster';
import { Toaster } from 'sonner';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <Toaster position="top-right" richColors />
            <FlashToaster />
            {children}
        </AppLayoutTemplate>
    );
}
