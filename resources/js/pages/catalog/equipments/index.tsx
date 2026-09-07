import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

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

interface EquipmentRow {
    id: number;
    name: string;
    status: boolean;
    series: string | null;
    modification: string | null;
    model: string | null;
    mark: string | null;
}

interface SelectedOption {
    id: number;
    label: string;
}

interface Props {
    equipments: PaginatedCollection<EquipmentRow>;
    state: TableState;
    filters: {
        mark_id: number | null;
        model_id: number | null;
        generation_id: number | null;
        series_id: number | null;
    };
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    selectedGeneration: SelectedOption | null;
    selectedSeries: SelectedOption | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];
const filterKeys = ['mark_id', 'model_id', 'generation_id', 'series_id'];

export default function CatalogEquipmentsIndex({
    equipments,
    state,
    filters,
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
}: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, setFilter, resetFilters, sortCol, sortDir } =
        useInertiaDataTable(state, filterKeys);

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
                clears: ['model_id', 'generation_id', 'series_id'],
            },
            {
                type: 'catalog',
                key: 'model_id',
                label: 'Модель',
                value: filters.model_id,
                selectedLabel: selectedModel?.label,
                resource: 'models',
                emptyLabel: 'Все модели',
                clears: ['generation_id', 'series_id'],
                resourceFilters: (draft) => ({
                    mark_id: draft.mark_id ? Number(draft.mark_id) : null,
                }),
            },
            {
                type: 'catalog',
                key: 'generation_id',
                label: 'Поколение',
                value: filters.generation_id,
                selectedLabel: selectedGeneration?.label,
                resource: 'generations',
                emptyLabel: 'Все поколения',
                clears: ['series_id'],
                resourceFilters: (draft) => ({
                    mark_id: draft.mark_id ? Number(draft.mark_id) : null,
                    model_id: draft.model_id ? Number(draft.model_id) : null,
                }),
            },
            {
                type: 'catalog',
                key: 'series_id',
                label: 'Серия',
                value: filters.series_id,
                selectedLabel: selectedSeries?.label,
                resource: 'series',
                emptyLabel: 'Все серии',
                resourceFilters: (draft) => ({
                    mark_id: draft.mark_id ? Number(draft.mark_id) : null,
                    model_id: draft.model_id ? Number(draft.model_id) : null,
                    generation_id: draft.generation_id ? Number(draft.generation_id) : null,
                }),
            },
        ],
        [
            filters.generation_id,
            filters.mark_id,
            filters.model_id,
            filters.series_id,
            selectedGeneration?.label,
            selectedMark?.label,
            selectedModel?.label,
            selectedSeries?.label,
        ],
    );

    const columns = useMemo<ColumnDef<EquipmentRow>[]>(
        () => [
            {
                accessorKey: 'mark',
                header: 'Марка',
                cell: ({ row }) => row.original.mark ?? '—',
            },
            {
                accessorKey: 'model',
                header: 'Модель',
                cell: ({ row }) => row.original.model ?? '—',
            },
            {
                accessorKey: 'series',
                header: 'Серия',
                cell: ({ row }) => row.original.series ?? '—',
            },
            {
                accessorKey: 'modification',
                header: 'Модификация',
                cell: ({ row }) => row.original.modification ?? '—',
            },
            {
                accessorKey: 'name',
                header: () => <SortableHeader title="Название" column="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
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
                        editHref={route('catalog.equipments.edit', row.original.id)}
                        destroyRoute={route('catalog.equipments.destroy', row.original.id)}
                        confirmMessage="Удалить комплектацию?"
                    />
                ),
            },
        ],
        [sortCol, sortDir, toggleSort],
    );

    const createHref = filters.series_id
        ? route('catalog.equipments.create', { series_id: filters.series_id })
        : route('catalog.equipments.create');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Комплектации" />
            <CatalogLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Комплектации" description="Комплектации автомобилей" />
                    <InertiaDataTable
                                columns={columns}
                                paginator={equipments}
                                search={state.search}
                                searchPlaceholder="Поиск по названию"
                                onSearch={setSearch}
                                filterFields={filterFields}
                                onFilterChange={setFilter}
                                onResetFilters={resetFilters}
                                onPerPageChange={setLimit}
                                toolbar={
                                    estPravo('catalog.manage') ? (
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
