import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function Pagination({ links }: Props) {
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center space-x-1 mt-4">
            {links.map((link, i) => {
                const isFirst = i === 0;
                const isLast = i === links.length - 1;
                
                let label = link.label;
                if (isFirst) label = '&laquo;';
                if (isLast) label = '&raquo;';

                if (link.url === null) {
                    return (
                        <div
                            key={i}
                            className="px-3 py-1 text-sm text-muted-foreground border rounded bg-muted/50 cursor-not-allowed opacity-50"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={cn(
                            "px-3 py-1 text-sm border rounded hover:bg-accent transition-colors",
                            link.active ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-card"
                        )}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
