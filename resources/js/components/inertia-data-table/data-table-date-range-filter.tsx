import { PlusCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { type DateRange } from 'react-day-picker';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { backendToDate, dateToBackend, formatDateLabel } from './date-utils';

interface DataTableDateRangeFilterProps {
    title: string;
    fromValue: string | null;
    toValue: string | null;
    onRangeChange: (from: string | null, to: string | null) => void;
}

function formatRangeLabel(fromValue: string | null, toValue: string | null): string {
    if (fromValue && toValue) {
        return `${formatDateLabel(fromValue)} — ${formatDateLabel(toValue)}`;
    }

    if (fromValue) {
        return `с ${formatDateLabel(fromValue)}`;
    }

    if (toValue) {
        return `по ${formatDateLabel(toValue)}`;
    }

    return '';
}

export function DataTableDateRangeFilter({ title, fromValue, toValue, onRangeChange }: DataTableDateRangeFilterProps) {
    const selected = useMemo<DateRange | undefined>(() => {
        const from = backendToDate(fromValue);
        const to = backendToDate(toValue);

        if (!from && !to) {
            return undefined;
        }

        return { from, to };
    }, [fromValue, toValue]);

    const hasValue = Boolean(fromValue || toValue);
    const label = formatRangeLabel(fromValue, toValue);

    const handleSelect = (range: DateRange | undefined) => {
        if (!range?.from && !range?.to) {
            onRangeChange(null, null);
            return;
        }

        const from = range?.from ? dateToBackend(range.from) : null;
        const to = range?.to ? dateToBackend(range.to) : null;

        onRangeChange(from, to);
    };

    const handleReset = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onRangeChange(null, null);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed px-2.5">
                    {hasValue ? (
                        <span
                            role="button"
                            tabIndex={0}
                            className="mr-1.5 inline-flex"
                            onClick={handleReset}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    handleReset(event as unknown as React.MouseEvent);
                                }
                            }}
                        >
                            <XCircle className="size-3.5" />
                        </span>
                    ) : (
                        <PlusCircle className="mr-1.5 size-3.5" />
                    )}
                    {title}
                    {hasValue ? (
                        <>
                            <Separator orientation="vertical" className="mx-1.5 h-4" />
                            <Badge
                                variant="secondary"
                                className={cn('rounded-sm px-1 py-0 font-normal', label.length > 28 && 'max-w-36 truncate')}
                            >
                                {label}
                            </Badge>
                        </>
                    ) : null}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    captionLayout="dropdown"
                    selected={selected}
                    onSelect={handleSelect}
                    defaultMonth={selected?.from ?? selected?.to}
                />
            </PopoverContent>
        </Popover>
    );
}
