import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';

import { CatalogRowActions } from '@/components/catalog/catalog-row-actions';
import HeadingSmall from '@/components/heading-small';
import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { SortableHeader } from '@/components/inertia-data-table/sortable-header';
import { Button } from '@/components/ui/button';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import CatalogLayout from '@/layouts/catalog/layout';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface OptionRow {
    id: number;
    name: string;
    sort: number;
    parent: string | null;
}

interface Props {
    options: PaginatedCollection<OptionRow>;
    state: TableState;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Каталог', href: '/catalog' }];

export default function CatalogOptionsIndex({ options, state }: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, sortCol, sortDir } = useInertiaDataTable(state);

    const columns = useMemo<ColumnDef<OptionRow>[]>(
        () => [
            {
                accessorKey: 'name',
                header: () => <SortableHeader title="Название" column="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                accessorKey: 'parent',
                header: 'Родитель',
                cell: ({ row }) => row.original.parent ?? '—',
            },
            {
                accessorKey: 'sort',
                header: () => <SortableHeader title="Сортировка" column="sort" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => (
                    <CatalogRowActions
                        editHref={route('catalog.options.edit', row.original.id)}
                        destroyRoute={route('catalog.options.destroy', row.original.id)}
                        confirmMessage="Удалить опцию?"
                    />
                ),
            },
        ],
        [sortCol, sortDir, toggleSort],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Опции" />
            <CatalogLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Опции" description="Справочник опций автомобилей" />
                    <InertiaDataTable
                                columns={columns}
                                paginator={options}
                                search={state.search}
                                searchPlaceholder="Поиск по названию"
                                onSearch={setSearch}
                                onPerPageChange={setLimit}
                                toolbar={
                                    estPravo('catalog.manage') ? (
                                        <Button size="sm" className="h-8" asChild>
                                            <Link href={route('catalog.options.create')}>
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
