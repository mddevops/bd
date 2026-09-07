import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { CatalogInlineOrderingCell } from '@/components/catalog/catalog-inline-ordering-cell';
import { CatalogMarksBulkActions } from '@/components/catalog/catalog-marks-bulk-actions';
import { CatalogRowActions } from '@/components/catalog/catalog-row-actions';
import { CatalogStatusBadge } from '@/components/catalog/catalog-status-badge';
import HeadingSmall from '@/components/heading-small';
import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { SortableHeader } from '@/components/inertia-data-table/sortable-header';
import { type DataTableFilterField } from '@/components/inertia-data-table/types';
import { Button } from '@/components/ui/button';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface MarkRow {
    id: number;
    name: string;
    name_ru: string | null;
    url: string;
    country: string | null;
    ordering: number | null;
    status: boolean;
    models_count: number;
}

interface Props {
    marks: PaginatedCollection<MarkRow>;
    state: TableState;
    filters: { status: boolean | null };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];
const filterKeys = ['status'];

export default function CatalogMarksIndex({ marks, state, filters }: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, setFilter, resetFilters, sortCol, sortDir } =
        useInertiaDataTable(state, filterKeys);

    const canManage = estPravo('catalog.manage');
    const canReorder = canManage && (!sortCol || sortCol === 'ordering') && !state.search;

    const filterFields = useMemo<DataTableFilterField[]>(
        () => [
            {
                type: 'select',
                key: 'status',
                label: 'Статус',
                value: filters.status === null ? null : filters.status ? '1' : '0',
                emptyLabel: 'Все статусы',
                options: [
                    { value: '1', label: 'Активна' },
                    { value: '0', label: 'Неактивна' },
                ],
            },
        ],
        [filters.status],
    );

    const columns = useMemo<ColumnDef<MarkRow>[]>(
        () => [
            {
                accessorKey: 'ordering',
                header: () => (
                    <SortableHeader title="Порядок" column="ordering" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <CatalogInlineOrderingCell
                        value={row.original.ordering}
                        updateUrl={route('catalog.marks.ordering', row.original.id)}
                        disabled={!canManage}
                        only={['marks', 'state', 'filters', 'flash']}
                    />
                ),
            },
            {
                accessorKey: 'name',
                header: () => <SortableHeader title="Название" column="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                accessorKey: 'name_ru',
                header: 'Название (RU)',
                cell: ({ row }) => row.original.name_ru ?? '—',
            },
            {
                accessorKey: 'url',
                header: () => <SortableHeader title="URL" column="url" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                accessorKey: 'country',
                header: 'Страна',
                cell: ({ row }) => row.original.country ?? '—',
            },
            { accessorKey: 'models_count', header: 'Моделей' },
            {
                id: 'status',
                header: 'Статус',
                cell: ({ row }) => <CatalogStatusBadge active={row.original.status} activeLabel="Активна" inactiveLabel="Неактивна" />,
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <CatalogRowActions
                        editHref={route('catalog.marks.edit', row.original.id)}
                        destroyRoute={route('catalog.marks.destroy', row.original.id)}
                        recordName={row.original.name}
                    />
                ),
            },
        ],
        [canManage, sortCol, sortDir, toggleSort],
    );

    const handleReorder = (ids: number[]) => {
        router.post(
            route('catalog.marks.reorder'),
            { ids },
            {
                preserveScroll: true,
                only: ['marks', 'state', 'filters', 'flash'],
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Марки" />
            <CatalogLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Марки" description="Производители автомобилей" />
                    {!canReorder && canManage ? (
                        <p className="text-muted-foreground text-xs">
                            Чтобы менять порядок перетаскиванием, сбросьте поиск и сортируйте по колонке «Порядок».
                        </p>
                    ) : null}
                    <InertiaDataTable
                                columns={columns}
                                paginator={marks}
                                search={state.search}
                                searchPlaceholder="Поиск по названию или стране"
                                onSearch={setSearch}
                                filterFields={filterFields}
                                onFilterChange={setFilter}
                                onResetFilters={resetFilters}
                                onPerPageChange={setLimit}
                                reorderable={canReorder}
                                onReorder={handleReorder}
                                selectable={canManage}
                                bulkActions={({ selectedIds, clearSelection }) => (
                                    <CatalogMarksBulkActions selectedIds={selectedIds} clearSelection={clearSelection} />
                                )}
                                toolbar={
                                    canManage ? (
                                        <Button size="sm" className="h-8" asChild>
                                            <Link href={route('catalog.marks.create')}>
                                                <Plus className="mr-1.5 size-3.5" />
                                                Добавить
                                            </Link>
                                        </Button>
                                    ) : undefined
                                }
                            />
                </div>
            </CatalogLayout>
        </AppLayout>
    );
}
