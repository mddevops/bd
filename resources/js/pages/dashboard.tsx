import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Package, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

interface StatusChip {
    id: number | null;
    name: string;
    color: string | null;
    text_color: string | null;
    total: number;
}

interface NamedTotal {
    name: string;
    total: number;
}

interface RecentItem {
    id: number;
    title: string;
    year: number | null;
    showroom: string | null;
    arrival_date: string | null;
    sale_price: number | null;
    mileage?: number | null;
    status: { name: string; color: string | null; text_color: string | null } | null;
}

interface FleetSummary {
    total: number;
    in_stock: number;
    sold: number;
    sold_this_month: number;
    arrived_this_month: number;
    arrived_this_week: number;
    stock_value: number;
    avg_sale_price: number;
    aging_over_30: number;
    aging_over_60: number;
    without_status: number;
    avg_mileage?: number;
    trade_in?: number;
    potential_margin?: number;
}

interface FleetReport {
    title: string;
    href: string;
    summary: FleetSummary;
    by_status: StatusChip[];
    by_showroom: NamedTotal[];
    top_marks: NamedTotal[];
    recent: RecentItem[];
}

interface Props {
    cars: FleetReport | null;
    used_cars: FleetReport | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Панель',
        href: '/dashboard',
    },
];

function formatMoney(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return value.toLocaleString('ru-RU') + ' ₽';
}

function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '—';
    }

    return value.toLocaleString('ru-RU');
}

function MetricCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
            {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
        </div>
    );
}

function DistributionList({ title, items }: { title: string; items: NamedTotal[] }) {
    const max = Math.max(...items.map((item) => item.total), 1);

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">{title}</h4>
            {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">Пока нет данных</p>
            ) : (
                <ul className="space-y-2.5">
                    {items.map((item) => (
                        <li key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="truncate">{item.name}</span>
                                <span className="text-muted-foreground tabular-nums">{item.total}</span>
                            </div>
                            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                <div
                                    className="bg-foreground/70 h-full rounded-full"
                                    style={{ width: `${Math.max(8, (item.total / max) * 100)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function StatusList({ items }: { items: StatusChip[] }) {
    const max = Math.max(...items.map((item) => item.total), 1);

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium">По статусам</h4>
            {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">Статусы ещё не назначены</p>
            ) : (
                <ul className="space-y-2.5">
                    {items.map((item) => (
                        <li key={`${item.id ?? 'none'}-${item.name}`} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="size-2.5 shrink-0 rounded-full border"
                                        style={{ backgroundColor: item.color || 'var(--border)' }}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </span>
                                <span className="text-muted-foreground tabular-nums">{item.total}</span>
                            </div>
                            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.max(8, (item.total / max) * 100)}%`,
                                        backgroundColor: item.color || 'var(--foreground)',
                                        opacity: item.color ? 1 : 0.35,
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function AttentionBlock({ summary }: { summary: FleetSummary }) {
    const items = [
        summary.aging_over_60 > 0
            ? { label: `На складе более 60 дней`, value: summary.aging_over_60, tone: 'danger' as const }
            : null,
        summary.aging_over_30 > 0
            ? { label: `На складе более 30 дней`, value: summary.aging_over_30, tone: 'warn' as const }
            : null,
        summary.without_status > 0
            ? { label: 'Без статуса', value: summary.without_status, tone: 'warn' as const }
            : null,
    ].filter(Boolean) as Array<{ label: string; value: number; tone: 'danger' | 'warn' }>;

    if (items.length === 0) {
        return (
            <div className="bg-muted/40 flex items-start gap-3 rounded-xl border border-dashed p-4">
                <TrendingUp className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                    <p className="text-sm font-medium">Всё под контролем</p>
                    <p className="text-muted-foreground text-xs">Нет зависших авто и пропусков по статусам</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="size-4 text-amber-600" />
                Требует внимания
            </h4>
            <ul className="space-y-2">
                {items.map((item) => (
                    <li
                        key={item.label}
                        className={cn(
                            'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                            item.tone === 'danger' && 'border-destructive/30 bg-destructive/5',
                            item.tone === 'warn' && 'border-amber-500/30 bg-amber-500/5',
                        )}
                    >
                        <span>{item.label}</span>
                        <span className="font-semibold tabular-nums">{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function RecentTable({
    items,
    href,
    showMileage = false,
}: {
    items: RecentItem[];
    href: string;
    showMileage?: boolean;
}) {
    const cellClass = 'px-3 py-2';
    const headClass = 'h-9 bg-background px-3 text-xs font-medium whitespace-nowrap';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">Последние поступления</h4>
                <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                    <Link href={href}>
                        Все
                        <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className={headClass}>Дата</TableHead>
                            <TableHead className={headClass}>Автомобиль</TableHead>
                            <TableHead className={headClass}>Год</TableHead>
                            <TableHead className={headClass}>Шоурум</TableHead>
                            {showMileage ? <TableHead className={headClass}>Пробег</TableHead> : null}
                            <TableHead className={headClass}>Статус</TableHead>
                            <TableHead className={cn(headClass, 'text-right')}>Цена</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={showMileage ? 7 : 6}
                                    className="text-muted-foreground h-16 px-3 text-center"
                                >
                                    Поступлений пока нет
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className={cn(cellClass, 'whitespace-nowrap')}>
                                        {item.arrival_date ?? '—'}
                                    </TableCell>
                                    <TableCell className={cn(cellClass, 'max-w-[16rem] truncate font-medium')}>
                                        {item.title}
                                    </TableCell>
                                    <TableCell className={cn(cellClass, 'tabular-nums')}>
                                        {item.year ?? '—'}
                                    </TableCell>
                                    <TableCell className={cellClass}>{item.showroom ?? '—'}</TableCell>
                                    {showMileage ? (
                                        <TableCell className={cn(cellClass, 'tabular-nums whitespace-nowrap')}>
                                            {item.mileage != null ? `${formatNumber(item.mileage)} км` : '—'}
                                        </TableCell>
                                    ) : null}
                                    <TableCell className={cellClass}>
                                        {item.status ? (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px]"
                                                style={{
                                                    backgroundColor: item.status.color || undefined,
                                                    color: item.status.text_color || undefined,
                                                }}
                                            >
                                                {item.status.name}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className={cn(cellClass, 'text-right tabular-nums whitespace-nowrap')}>
                                        {formatMoney(item.sale_price)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function FleetSection({
    report,
    showUsedExtras = false,
}: {
    report: FleetReport;
    showUsedExtras?: boolean;
}) {
    const { summary } = report;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{report.title}</h2>
                <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href={report.href}>
                        Открыть
                        <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="На складе"
                        value={formatNumber(summary.in_stock)}
                        hint={`Всего записей: ${formatNumber(summary.total)}`}
                    />
                    <MetricCard
                        label="Стоимость склада"
                        value={formatMoney(summary.stock_value)}
                        hint={`Средняя цена: ${formatMoney(summary.avg_sale_price)}`}
                    />
                    <MetricCard
                        label="Пришло за месяц"
                        value={formatNumber(summary.arrived_this_month)}
                        hint={`За неделю: ${formatNumber(summary.arrived_this_week)}`}
                    />
                    <MetricCard
                        label="Продано за месяц"
                        value={formatNumber(summary.sold_this_month)}
                        hint={`Всего продано: ${formatNumber(summary.sold)}`}
                    />
                </div>

                {showUsedExtras ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <MetricCard label="Trade-in на складе" value={formatNumber(summary.trade_in)} />
                        <MetricCard label="Средний пробег" value={`${formatNumber(summary.avg_mileage)} км`} />
                        <MetricCard
                            label="Потенциальная маржа"
                            value={formatMoney(summary.potential_margin)}
                            hint="Продажа минус закупка по складу"
                        />
                    </div>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-3">
                    <AttentionBlock summary={summary} />
                    <StatusList items={report.by_status} />
                    <div className="space-y-6">
                        <DistributionList title="По шоурумам" items={report.by_showroom} />
                        <DistributionList title="Топ марок" items={report.top_marks} />
                    </div>
                </div>

                <RecentTable items={report.recent} href={report.href} showMileage={showUsedExtras} />
            </div>
        </section>
    );
}

export default function Dashboard({ cars, used_cars }: Props) {
    const hasAny = Boolean(cars || used_cars);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Панель" />
            <AppPageContent>
                {!hasAny ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <Package className="text-muted-foreground size-10" />
                        <div className="space-y-1">
                            <p className="font-medium">Нет доступных отчётов</p>
                            <p className="text-muted-foreground max-w-md text-sm">
                                Включите модули автомобилей в настройках системы или получите права на просмотр.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {cars ? <FleetSection report={cars} /> : null}
                        {used_cars ? <FleetSection report={used_cars} showUsedExtras /> : null}
                    </div>
                )}
            </AppPageContent>
        </AppLayout>
    );
}
