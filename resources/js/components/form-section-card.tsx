import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
    title: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function FormSectionCard({ title, action, children, className }: Props) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 overflow-hidden rounded-lg bg-muted/40 text-sm text-card-foreground ring-1 ring-foreground/10',
                className,
            )}
        >
            <div className="flex min-h-10 items-center justify-between gap-2 px-4 py-2.5">
                <div className="text-sm leading-snug font-semibold">{title}</div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
            <div className="flex-1 overflow-hidden rounded-lg bg-card p-4 ring-1 ring-foreground/5 shadow-2xs">{children}</div>
        </div>
    );
}
