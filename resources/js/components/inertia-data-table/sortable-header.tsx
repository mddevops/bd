import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SortableHeaderProps {
    title: string;
    column: string;
    sortCol: string;
    sortDir: string;
    onSort: (column: string) => void;
}

export function SortableHeader({ title, column, sortCol, sortDir, onSort }: SortableHeaderProps) {
    const isActive = sortCol === column;

    return (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => onSort(column)}>
            {title}
            {isActive ? (
                sortDir === 'asc' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowDown className="ml-2 h-4 w-4" />
                )
            ) : (
                <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
}
