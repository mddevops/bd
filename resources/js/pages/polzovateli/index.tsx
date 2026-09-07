import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { type DataTableFilterField } from '@/components/inertia-data-table/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface RolKratko {
    id: number;
    name: string;
    otobrazhaemoe_imya: string;
}

interface PolzovatelStroka {
    id: number;
    name: string;
    email: string;
    aktiven: boolean;
    roli: RolKratko[];
    created_at: string | null;
}

interface PolzovateliFilters {
    aktiven: string | null;
    rol: string | null;
    created_at_from: string | null;
    created_at_to: string | null;
}

interface Props {
    polzovateli: PaginatedCollection<PolzovatelStroka>;
    state: TableState;
    filters: PolzovateliFilters;
    dostupnyeRoli: RolKratko[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Пользователи',
        href: '/polzovateli',
    },
];

const filterKeys = ['aktiven', 'rol', 'created_at_from', 'created_at_to'];

const sortColumns = [
    { id: 'name', label: 'Имя' },
    { id: 'email', label: 'Email' },
    { id: 'aktiven', label: 'Статус' },
    { id: 'created_at', label: 'Создан' },
];

export default function PolzovateliIndex({ polzovateli, state, filters, dostupnyeRoli }: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, setFilter, applyFilters, resetFilters, sortCol, sortDir } = useInertiaDataTable(state, filterKeys);

    const filterFields = useMemo<DataTableFilterField[]>(
        () => [
            {
                type: 'select',
                key: 'aktiven',
                label: 'Статус',
                value: filters.aktiven,
                options: [
                    { value: '1', label: 'Активен' },
                    { value: '0', label: 'Неактивен' },
                ],
            },
            {
                type: 'select',
                key: 'rol',
                label: 'Роль',
                value: filters.rol,
                options: dostupnyeRoli.map((rol) => ({
                    value: String(rol.id),
                    label: rol.otobrazhaemoe_imya,
                })),
            },
            {
                type: 'dateRange',
                key: 'created_at',
                label: 'Создан',
                fromKey: 'created_at_from',
                toKey: 'created_at_to',
                fromValue: filters.created_at_from,
                toValue: filters.created_at_to,
            },
        ],
        [filters, dostupnyeRoli],
    );

    const columns = useMemo<ColumnDef<PolzovatelStroka>[]>(
        () => [
            {
                accessorKey: 'name',
                meta: { label: 'Имя' },
                header: 'Имя',
            },
            {
                accessorKey: 'email',
                meta: { label: 'Email' },
                header: 'Email',
            },
            {
                id: 'roli',
                accessorFn: (row) => row.roli.map((rol) => rol.otobrazhaemoe_imya).join(', '),
                meta: { label: 'Роли' },
                header: 'Роли',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {row.original.roli.map((rol) => (
                            <Badge key={rol.id} variant="secondary" className="px-1.5 py-0 text-xs font-normal">
                                {rol.otobrazhaemoe_imya}
                            </Badge>
                        ))}
                    </div>
                ),
            },
            {
                id: 'aktiven',
                accessorKey: 'aktiven',
                meta: { label: 'Статус' },
                header: 'Статус',
                cell: ({ row }) => (
                    <Badge
                        variant={row.original.aktiven ? 'default' : 'destructive'}
                        className="px-1.5 py-0 text-xs font-normal"
                    >
                        {row.original.aktiven ? 'Активен' : 'Неактивен'}
                    </Badge>
                ),
            },
            {
                accessorKey: 'created_at',
                meta: { label: 'Создан' },
                header: 'Создан',
                cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.created_at ?? '—'}</span>,
            },
            {
                id: 'deystviya',
                header: '',
                enableHiding: false,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7">
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {estPravo('polzovateli.redaktirovanie') && (
                                <DropdownMenuItem asChild>
                                    <Link href={route('polzovateli.edit', row.original.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Редактировать
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {estPravo('polzovateli.udalenie') && (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Удалить пользователя?')) {
                                            router.delete(route('polzovateli.destroy', row.original.id));
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [estPravo],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Пользователи" />

            <AppPageContent title="Пользователи" description="Управление учётными записями и назначение ролей">
                <InertiaDataTable
                    columns={columns}
                    paginator={polzovateli}
                    search={state.search}
                    searchPlaceholder="Поиск по имени или email"
                    onSearch={setSearch}
                    onPerPageChange={setLimit}
                    filterFields={filterFields}
                    onFilterChange={setFilter}
                    onFiltersChange={applyFilters}
                    onResetFilters={resetFilters}
                    sortColumns={sortColumns}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    toolbar={
                        estPravo('polzovateli.sozdanie') ? (
                            <Button size="sm" className="h-8" asChild>
                                <Link href={route('polzovateli.create')}>
                                    <Plus className="mr-1.5 size-3.5" />
                                    Добавить
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </AppPageContent>
        </AppLayout>
    );
}
