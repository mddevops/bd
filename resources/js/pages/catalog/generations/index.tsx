import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { CatalogRowActions } from '@/components/catalog/catalog-row-actions';
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

interface GenerationRow {
    id: number;
    name: string;
    year_from: number | null;
    year_to: number | null;
    model: string | null;
    mark: string | null;
}

interface SelectedOption {
    id: number;
    label: string;
}

interface Props {
    generations: PaginatedCollection<GenerationRow>;
    state: TableState;
    filters: { mark_id: number | null; model_id: number | null };
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];
const filterKeys = ['mark_id', 'model_id'];

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

export default function CatalogGenerationsIndex({
    generations,
    state,
    filters,
    selectedMark,
    selectedModel,
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
                clears: ['model_id'],
            },
            {
                type: 'catalog',
                key: 'model_id',
                label: 'Модель',
                value: filters.model_id,
                selectedLabel: selectedModel?.label,
                resource: 'models',
                emptyLabel: 'Все модели',
                resourceFilters: (draft) => ({
                    mark_id: draft.mark_id ? Number(draft.mark_id) : null,
                }),
            },
        ],
        [filters.mark_id, filters.model_id, selectedMark?.label, selectedModel?.label],
    );

    const columns = useMemo<ColumnDef<GenerationRow>[]>(
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
                accessorKey: 'name',
                header: () => <SortableHeader title="Название" column="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                id: 'years',
                header: 'Годы',
                cell: ({ row }) => formatYears(row.original.year_from, row.original.year_to),
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <CatalogRowActions
                        editHref={route('catalog.generations.edit', row.original.id)}
                        destroyRoute={route('catalog.generations.destroy', row.original.id)}
                        confirmMessage="Удалить поколение?"
                    />
                ),
            },
        ],
        [sortCol, sortDir, toggleSort],
    );

    const createParams: Record<string, number> = {};
    if (filters.model_id) {
        createParams.model_id = filters.model_id;
    } else if (filters.mark_id) {
        createParams.mark_id = filters.mark_id;
    }
    const createHref = Object.keys(createParams).length
        ? route('catalog.generations.create', createParams)
        : route('catalog.generations.create');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Поколения" />
            <CatalogLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Поколения" description="Поколения моделей автомобилей" />
                    <InertiaDataTable
                                columns={columns}
                                paginator={generations}
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
