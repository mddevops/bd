import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    title: string;
    backHref: string;
    actions?: ReactNode;
    className?: string;
}

export function FormPageHeader({ title, backHref, actions, className }: Props) {
    return (
        <div className={cn('mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center', className)}>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="size-8 shrink-0" asChild>
                    <Link href={backHref}>
                        <ChevronLeft className="size-4" />
                        <span className="sr-only">Назад</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            {actions ? <div className="flex gap-2">{actions}</div> : null}
        </div>
    );
}
