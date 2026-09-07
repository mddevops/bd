import { FormEventHandler, ReactNode } from 'react';

import { FormPageHeader } from '@/components/form-page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    title: string;
    backHref: string;
    processing: boolean;
    onSubmit: FormEventHandler;
    main: ReactNode;
    sidebar?: ReactNode;
    submitLabel?: string;
    className?: string;
}

export function FormShell({
    title,
    backHref,
    processing,
    onSubmit,
    main,
    sidebar,
    submitLabel = 'Сохранить',
    className,
}: Props) {
    return (
        <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
            <FormPageHeader
                title={title}
                backHref={backHref}
                actions={
                    <Button type="submit" disabled={processing}>
                        {submitLabel}
                    </Button>
                }
            />

            <div className="grid gap-4 lg:grid-cols-5">
                <div className={cn('space-y-4', sidebar ? 'lg:col-span-3' : 'lg:col-span-5')}>{main}</div>
                {sidebar ? <div className="space-y-4 lg:col-span-2">{sidebar}</div> : null}
            </div>
        </form>
    );
}
