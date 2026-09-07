import { PlusCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DataTableNumberRangeFilterProps {
    title: string;
    fromValue: string | null;
    toValue: string | null;
    fromPlaceholder?: string;
    toPlaceholder?: string;
    onRangeChange: (from: string | null, to: string | null) => void;
}

function formatRangeLabel(fromValue: string | null, toValue: string | null): string {
    if (fromValue && toValue) {
        return `${fromValue} — ${toValue}`;
    }

    if (fromValue) {
        return `от ${fromValue}`;
    }

    if (toValue) {
        return `до ${toValue}`;
    }

    return '';
}

function normalizeNumber(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed === '') {
        return null;
    }

    if (!/^\d+$/.test(trimmed)) {
        return null;
    }

    return String(Number(trimmed));
}

export function DataTableNumberRangeFilter({
    title,
    fromValue,
    toValue,
    fromPlaceholder = 'От',
    toPlaceholder = 'До',
    onRangeChange,
}: DataTableNumberRangeFilterProps) {
    const [open, setOpen] = useState(false);
    const [fromDraft, setFromDraft] = useState(fromValue ?? '');
    const [toDraft, setToDraft] = useState(toValue ?? '');

    useEffect(() => {
        setFromDraft(fromValue ?? '');
        setToDraft(toValue ?? '');
    }, [fromValue, toValue]);

    const hasValue = Boolean(fromValue || toValue);
    const label = formatRangeLabel(fromValue, toValue);

    const apply = () => {
        onRangeChange(normalizeNumber(fromDraft), normalizeNumber(toDraft));
        setOpen(false);
    };

    const handleReset = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setFromDraft('');
        setToDraft('');
        onRangeChange(null, null);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
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
            <PopoverContent className="w-64 space-y-3 p-3" align="start">
                <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor={`${title}-from`} className="text-xs">
                            {fromPlaceholder}
                        </Label>
                        <Input
                            id={`${title}-from`}
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={fromDraft}
                            onChange={(event) => setFromDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    apply();
                                }
                            }}
                            className="h-8"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor={`${title}-to`} className="text-xs">
                            {toPlaceholder}
                        </Label>
                        <Input
                            id={`${title}-to`}
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={toDraft}
                            onChange={(event) => setToDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    apply();
                                }
                            }}
                            className="h-8"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                            setFromDraft('');
                            setToDraft('');
                            onRangeChange(null, null);
                            setOpen(false);
                        }}
                    >
                        Сбросить
                    </Button>
                    <Button type="button" size="sm" className="h-8" onClick={apply}>
                        Применить
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
