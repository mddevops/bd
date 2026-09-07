import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { CatalogInlineOrderingCell } from '@/components/catalog/catalog-inline-ordering-cell';
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

interface ModelRow {
    id: number;
    name: string;
    name_ru: string | null;
    url: string;
    class: string | null;
    year_from: number | null;
    year_to: number | null;
    ordering: number | null;
    status: boolean;
    mark: string | null;
}

interface SelectedOption {
    id: number;
    label: string;
}

interface Props {
    models: PaginatedCollection<ModelRow>;
    state: TableState;
    filters: { mark_id: number | null };
    selectedMark: SelectedOption | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];
const filterKeys = ['mark_id'];

function formatYears(from: number | null, to: number | null): string {
    if (from && to) {
        return `${from}—${to}`;
    }
    if (from) {
        return `${from}—`;
    }
    if (to) {
        return `—${to}`;
    }
    return '—';
}

export default function CatalogModelsIndex({ models, state, filters, selectedMark }: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, setFilter, resetFilters, sortCol, sortDir } =
        useInertiaDataTable(state, filterKeys);

    const canManage = estPravo('catalog.manage');
    const canReorder = canManage && (!sortCol || sortCol === 'ordering') && !state.search;

    const filterFields = useMemo<DataTableFilterField[]>(
        () => [
            {
                type: 'catalog',
                key: 'mark_id',
                label: 'Марка',
                value: filters.mark_id,
                selectedLabel: selectedMark?.label,
                resource: 'marks',
                emptyLabel: 'Все марки',
            },
        ],
        [filters.mark_id, selectedMark?.label],
    );

    const columns = useMemo<ColumnDef<ModelRow>[]>(
        () => [
            {
                accessorKey: 'ordering',
                header: () => (
                    <SortableHeader title="Порядок" column="ordering" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                ),
                cell: ({ row }) => (
                    <CatalogInlineOrderingCell
                        value={row.original.ordering}
                        updateUrl={route('catalog.models.ordering', row.original.id)}
                        disabled={!canManage}
                        only={['models', 'state', 'filters', 'selectedMark', 'flash']}
                    />
                ),
            },
            {
                accessorKey: 'mark',
                header: 'Марка',
                cell: ({ row }) => row.original.mark ?? '—',
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
                accessorKey: 'class',
                header: 'Класс',
                cell: ({ row }) => row.original.class ?? '—',
            },
            {
                id: 'years',
                header: 'Годы',
                cell: ({ row }) => formatYears(row.original.year_from, row.original.year_to),
            },
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
                        editHref={route('catalog.models.edit', row.original.id)}
                        destroyRoute={route('catalog.models.destroy', row.original.id)}
                        confirmMessage="Удалить модель?"
                    />
                ),
            },
        ],
        [canManage, sortCol, sortDir, toggleSort],
    );

    const handleReorder = (ids: number[]) => {
        router.post(
            route('catalog.models.reorder'),
            { ids, mark_id: filters.mark_id },
            {
                preserveScroll: true,
                only: ['models', 'state', 'filters', 'selectedMark', 'flash'],
            },
        );
    };

    const createHref = filters.mark_id ? route('catalog.models.create', { mark_id: filters.mark_id }) : route('catalog.models.create');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Модели" />
            <CatalogLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Модели" description="Модели автомобилей по маркам" />
                    {!canReorder && canManage ? (
                        <p className="text-muted-foreground text-xs">
                            Чтобы менять порядок перетаскиванием, сбросьте поиск и сортируйте по колонке «Порядок». Удобнее
                            фильтровать по марке, чтобы сортировать модели одной марки.
                        </p>
                    ) : null}
                    <InertiaDataTable
                                columns={columns}
                                paginator={models}
                                search={state.search}
                                searchPlaceholder="Поиск по названию"
                                onSearch={setSearch}
                                filterFields={filterFields}
                                onFilterChange={setFilter}
                                onResetFilters={resetFilters}
                                onPerPageChange={setLimit}
                                reorderable={canReorder}
                                onReorder={handleReorder}
                                toolbar={
                                    canManage ? (
                                        <Button size="sm" className="h-8" asChild>
                                            <Link href={createHref}>
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
