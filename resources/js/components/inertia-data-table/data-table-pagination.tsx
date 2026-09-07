import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';

import { StaticSearchCombobox } from '@/components/search-combobox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type PaginatedCollection } from '@/types/pagination';

interface DataTablePaginationProps<T> {
    paginator: PaginatedCollection<T>;
    perPageOptions?: number[];
    onPerPageChange?: (limit: number) => void;
}

function pageHref(page: number | null): string | null {
    if (!page || page < 1) {
        return null;
    }

    const url = new URL(window.location.href);

    if (page <= 1) {
        url.searchParams.delete('page');
    } else {
        url.searchParams.set('page', String(page));
    }

    return `${url.pathname}${url.search}`;
}

/** Окно страниц: 1 … 4 5 6 … 45 */
function buildPageItems(current: number, last: number): Array<number | 'ellipsis'> {
    if (last <= 7) {
        return Array.from({ length: last }, (_, index) => index + 1);
    }

    const items: Array<number | 'ellipsis'> = [];
    const showLeft = Math.max(2, current - 1);
    const showRight = Math.min(last - 1, current + 1);

    items.push(1);

    if (showLeft > 2) {
        items.push('ellipsis');
    }

    for (let page = showLeft; page <= showRight; page += 1) {
        items.push(page);
    }

    if (showRight < last - 1) {
        items.push('ellipsis');
    }

    items.push(last);

    return items;
}

function NavButton({
    href,
    label,
    icon,
    className,
}: {
    href: string | null;
    label: string;
    icon: React.ReactNode;
    className?: string;
}) {
    const classes = cn('size-8', !href && 'pointer-events-none opacity-50', className);

    if (!href) {
        return (
            <Button variant="outline" size="icon" className={classes} disabled aria-label={label}>
                {icon}
            </Button>
        );
    }

    return (
        <Button variant="outline" size="icon" className={classes} asChild aria-label={label}>
            <Link href={href} preserveState preserveScroll>
                {icon}
            </Link>
        </Button>
    );
}

function PageButton({ page, isActive }: { page: number; isActive: boolean }) {
    const href = pageHref(page);

    if (!href) {
        return null;
    }

    return (
        <Button
            variant={isActive ? 'outline' : 'ghost'}
            size="icon"
            className={cn('size-8 text-xs tabular-nums', isActive && 'pointer-events-none')}
            asChild={!isActive}
            aria-label={`Страница ${page}`}
            aria-current={isActive ? 'page' : undefined}
            disabled={isActive}
        >
            {isActive ? (
                page
            ) : (
                <Link href={href} preserveState preserveScroll>
                    {page}
                </Link>
            )}
        </Button>
    );
}

const DEFAULT_PER_PAGE_OPTIONS = [10, 15, 25, 50];

export function DataTablePagination<T>({
    paginator,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
    onPerPageChange,
}: DataTablePaginationProps<T>) {
    const { from, to, total, current_page, last_page, per_page } = paginator;

    const pageSizeOptions = useMemo(
        () =>
            Array.from(new Set([...perPageOptions, per_page]))
                .sort((a, b) => a - b)
                .map((option) => ({
                    value: String(option),
                    label: String(option),
                })),
        [perPageOptions, per_page],
    );

    const pageItems = useMemo(
        () => buildPageItems(current_page, Math.max(1, last_page)),
        [current_page, last_page],
    );

    const firstHref = pageHref(1);
    const prevHref = pageHref(current_page > 1 ? current_page - 1 : null);
    const nextHref = pageHref(current_page < last_page ? current_page + 1 : null);
    const lastHref = pageHref(last_page > 1 ? last_page : null);

    return (
        <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
            <p className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
                {from && to ? (
                    <>
                        Показано {from}–{to} из {total}
                    </>
                ) : (
                    <>Записей: {total}</>
                )}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
                {onPerPageChange ? (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium whitespace-nowrap">Строк на странице</span>
                        <StaticSearchCombobox
                            value={String(per_page)}
                            options={pageSizeOptions}
                            onChange={(next) => onPerPageChange(Number(next))}
                            className="w-[4.25rem] [&_[data-slot=input-group]]:h-8 [&_[data-slot=input-group-control]]:text-sm"
                        />
                    </div>
                ) : null}

                <div className="flex items-center gap-1">
                    <NavButton
                        href={current_page > 1 ? firstHref : null}
                        label="Первая страница"
                        icon={<ChevronsLeft className="size-4" />}
                        className="hidden sm:inline-flex"
                    />
                    <NavButton href={prevHref} label="Назад" icon={<ChevronLeft className="size-4" />} />

                    <div className="flex items-center gap-0.5">
                        {pageItems.map((item, index) =>
                            item === 'ellipsis' ? (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="text-muted-foreground flex size-8 items-center justify-center"
                                    aria-hidden
                                >
                                    <MoreHorizontal className="size-4" />
                                </span>
                            ) : (
                                <PageButton key={item} page={item} isActive={item === current_page} />
                            ),
                        )}
                    </div>

                    <NavButton href={nextHref} label="Вперёд" icon={<ChevronRight className="size-4" />} />
                    <NavButton
                        href={current_page < last_page ? lastHref : null}
                        label="Последняя страница"
                        icon={<ChevronsRight className="size-4" />}
                        className="hidden sm:inline-flex"
                    />
                </div>
            </div>
        </div>
    );
}
