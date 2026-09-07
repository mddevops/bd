import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { SortableHeader } from '@/components/inertia-data-table/sortable-header';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface RolStroka {
    id: number;
    name: string;
    otobrazhaemoe_imya: string;
    opisanie: string | null;
    prav_count: number;
    polzovateley_count: number;
    created_at: string | null;
}

interface Props {
    roli: PaginatedCollection<RolStroka>;
    state: TableState;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Роли',
        href: '/roli',
    },
];

export default function RoliIndex({ roli, state }: Props) {
    const { estPravo } = useDostup();
    const { setSearch, toggleSort, setLimit, sortCol, sortDir } = useInertiaDataTable(state);

    const columns = useMemo<ColumnDef<RolStroka>[]>(
        () => [
            {
                accessorKey: 'otobrazhaemoe_imya',
                header: () => (
                    <SortableHeader title="Название" column="otobrazhaemoe_imya" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                ),
            },
            {
                accessorKey: 'name',
                header: () => <SortableHeader title="Системное имя" column="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                accessorKey: 'opisanie',
                header: 'Описание',
                cell: ({ row }) => row.original.opisanie ?? '—',
            },
            {
                accessorKey: 'prav_count',
                header: 'Прав',
            },
            {
                accessorKey: 'polzovateley_count',
                header: 'Пользователей',
            },
            {
                accessorKey: 'created_at',
                header: () => <SortableHeader title="Создана" column="created_at" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />,
            },
            {
                id: 'deystviya',
                header: '',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {estPravo('roli.upravlenie') && (
                                <DropdownMenuItem asChild>
                                    <Link href={route('roli.edit', row.original.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Редактировать
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {estPravo('roli.udalenie') && row.original.name !== 'administrator' && (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                        if (confirm('Удалить роль?')) {
                                            router.delete(route('roli.destroy', row.original.id));
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
        [estPravo, sortCol, sortDir, toggleSort],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Роли" />

            <AppPageContent title="Роли и доступы" description="Настройка ролей и прав для разделов CRM">
                <InertiaDataTable
                    columns={columns}
                    paginator={roli}
                    search={state.search}
                    searchPlaceholder="Поиск по названию"
                    onSearch={setSearch}
                    onPerPageChange={setLimit}
                    toolbar={
                        estPravo('roli.upravlenie') ? (
                            <Button size="sm" className="h-8" asChild>
                                <Link href={route('roli.create')}>
                                    <Plus className="mr-1.5 size-3.5" />
                                    Добавить роль
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />
            </AppPageContent>
        </AppLayout>
    );
}
