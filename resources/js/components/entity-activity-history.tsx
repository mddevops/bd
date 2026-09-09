import { History } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Timeline,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineHeader,
    TimelineItem,
    TimelineTime,
    TimelineTitle,
} from '@/components/ui/timeline';
import { cn } from '@/lib/utils';

export interface ActivityChange {
    field: string;
    label: string;
    old: string | null;
    new: string | null;
}

export interface ActivityItem {
    id: number;
    event: string;
    event_label: string;
    description: string;
    causer: { id: number; name: string } | null;
    created_at: string | null;
    created_at_iso: string | null;
    changes: ActivityChange[];
}

interface Props {
    url: string | null;
    className?: string;
}

const eventStatusStyles: Record<string, { wrap: string; dot: string }> = {
    viewed: {
        wrap: 'bg-emerald-500/10 text-foreground',
        dot: 'bg-emerald-500',
    },
    updated: {
        wrap: 'bg-orange-500/10 text-foreground',
        dot: 'bg-orange-500',
    },
    deleted: {
        wrap: 'bg-red-500/10 text-foreground',
        dot: 'bg-red-500',
    },
    restored: {
        wrap: 'bg-teal-500/10 text-foreground',
        dot: 'bg-teal-500',
    },
    created: {
        wrap: 'bg-sky-500/10 text-foreground',
        dot: 'bg-sky-500',
    },
};

function EventStatusBadge({ event, label }: { event: string; label: string }) {
    const styles = eventStatusStyles[event] ?? {
        wrap: 'bg-muted text-foreground',
        dot: 'bg-muted-foreground',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                styles.wrap,
            )}
        >
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', styles.dot)} />
            {label}
        </span>
    );
}

function CellValue({ value }: { value: string | null }) {
    if (value === null || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <span className="block max-w-md truncate" title={value}>
            {value}
        </span>
    );
}

function ChangesTable({ changes }: { changes: ActivityChange[] }) {
    return (
        <div className="overflow-hidden rounded-md border">
            <Table className="text-xs">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted/40 h-7 text-xs">Поле</TableHead>
                        <TableHead className="bg-muted/40 h-7 text-xs">Было</TableHead>
                        <TableHead className="bg-muted/40 h-7 text-xs">Стало</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {changes.map((change) => (
                        <TableRow key={change.field} className="hover:bg-transparent">
                            <TableCell className="py-1.5 font-medium whitespace-nowrap">{change.label}</TableCell>
                            <TableCell className="text-muted-foreground py-1.5">
                                <CellValue value={change.old} />
                            </TableCell>
                            <TableCell className="py-1.5">
                                <CellValue value={change.new} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function EntityActivityHistoryButton({ url, className }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ActivityItem[] | null>(null);

    const load = useCallback(async () => {
        if (!url) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить историю');
            }

            const payload = (await response.json()) as { activities: ActivityItem[] };
            setItems(payload.activities ?? []);
        } catch {
            setError('Не удалось загрузить историю');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (open) {
            void load();
        }
    }, [open, load]);

    useEffect(() => {
        setItems(null);
        setError(null);
        setOpen(false);
    }, [url]);

    if (!url) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className={cn('gap-1.5', className)}>
                    <History className="size-3.5" aria-hidden />
                    История изменений
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>История изменений</DialogTitle>
                    <DialogDescription>
                        Кто открывал карточку и какие поля менялись
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="-mx-4 h-[min(65vh,720px)] px-4">
                    <div className="p-1 pr-3">
                        {loading ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">Загрузка…</p>
                        ) : null}

                        {error ? <p className="text-destructive py-8 text-center text-sm">{error}</p> : null}

                        {!loading && !error && items && items.length === 0 ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">Записей пока нет</p>
                        ) : null}

                        {!loading && !error && items && items.length > 0 ? (
                            <Timeline activeIndex={0} className="gap-0">
                                {items.map((item) => (
                                    <TimelineItem key={item.id} className="pb-6 last:pb-0">
                                        <TimelineDot />
                                        <TimelineConnector />
                                        <TimelineContent>
                                            <TimelineHeader>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <EventStatusBadge
                                                        event={item.event}
                                                        label={item.event_label}
                                                    />
                                                    <TimelineTime
                                                        dateTime={item.created_at_iso ?? undefined}
                                                        className="tabular-nums"
                                                    >
                                                        {item.created_at ?? '—'}
                                                    </TimelineTime>
                                                </div>
                                                <TimelineTitle className="text-sm">
                                                    {item.causer?.name ?? 'Система'}
                                                </TimelineTitle>
                                            </TimelineHeader>

                                            {item.changes.length > 0 ? (
                                                <div className="mt-2">
                                                    <ChangesTable changes={item.changes} />
                                                </div>
                                            ) : null}
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        ) : null}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Закрыть
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** @deprecated Используйте EntityActivityHistoryButton */
export const EntityActivityHistory = EntityActivityHistoryButton;
