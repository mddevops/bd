import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
    type: string;
    label: string;
}

interface Props {
    menu: MenuItem[];
    currentType: string;
    children: ReactNode;
}

export function DictionariesLayout({ menu, currentType, children }: Props) {
    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <aside className="w-full shrink-0 lg:w-56">
                <nav className="flex flex-col gap-1">
                    {menu.map((item) => (
                        <Button
                            key={item.type}
                            variant="ghost"
                            size="sm"
                            asChild
                            className={cn('w-full justify-start', currentType === item.type && 'bg-muted')}
                        >
                            <Link href={route('dictionaries.index', item.type)} prefetch>
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
