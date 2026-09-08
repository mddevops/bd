import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import {
    CarFormDialog,
    type CarDialogMode,
    type CarEditPayload,
} from '@/components/cars/car-form-dialog';
import { type CarDictionaries } from '@/components/cars/car-form';
import {
    CellExternalLink,
    CellMoney,
    CellText,
    CellVolumePower,
} from '@/components/cars/car-table-cells';
import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { type DataTableFilterField } from '@/components/inertia-data-table/types';
import { Button } from '@/components/ui/button';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface CarStatus {
    name: string;
    color: string | null;
    text_color: string | null;
}

interface CarRow {
    id: number;
    arrival_date: string | null;
    showroom: string | null;
    mark: string | null;
    model: string | null;
    year: number | null;
    complectation: string | null;
    body_type: string | null;
    wheel_type: string | null;
    transmission: string | null;
    engine_volume: string | null;
    power: number | null;
    engine_type: string | null;
    color: string | null;
    vin: string | null;
    body_number: string | null;
    price: number | null;
    sale_price: number | null;
    pts_type: number | null;
    pts_label: string | null;
    key_number: string | null;
    status: CarStatus | null;
    link: string | null;
}

interface CarsFilters {
    mark_id: number | null;
    model_id: number | null;
    transmission_id: number | null;
    wheel_type_id: number | null;
    body_type_id: number | null;
    engine_type_id: number | null;
    pts_type: number | null;
    year_from: number | null;
    year_to: number | null;
    arrival_date_from: string | null;
    arrival_date_to: string | null;
}

interface SelectedOption {
    id: number;
    label: string;
}

interface OptionItem {
    value: number;
    label: string;
}

interface Props {
    cars: PaginatedCollection<CarRow>;
    state: TableState;
    filters: CarsFilters;
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    dictionaries: CarDictionaries;
    ptsTypes: OptionItem[];
    formMode: CarDialogMode | null;
    editingCar: CarEditPayload | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Новые авто',
        href: '/cars',
    },
];

const filterKeys = [
    'mark_id',
    'model_id',
    'transmission_id',
    'wheel_type_id',
    'body_type_id',
    'engine_type_id',
    'pts_type',
    'year_from',
    'year_to',
    'arrival_date_from',
    'arrival_date_to',
];

function asFilterString(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return String(value);
}

export default function CarsIndex({
    cars,
    state,
    filters,
    selectedMark,
    selectedModel,
    dictionaries,
    ptsTypes,
    formMode,
    editingCar,
}: Props) {
    const { estPravo } = useDostup();
    const { setSearch, setLimit, setFilter, applyFilters, resetFilters } = useInertiaDataTable(state, filterKeys);

    const [dialogOpen, setDialogOpen] = useState(
        formMode === 'create' || formMode === 'edit' || formMode === 'view',
    );
    const [dialogMode, setDialogMode] = useState<CarDialogMode | null>(formMode);
    const [dialogCar, setDialogCar] = useState<CarEditPayload | null>(editingCar);

    useEffect(() => {
        if (formMode === 'create' || formMode === 'edit' || formMode === 'view') {
            setDialogMode(formMode);
            setDialogCar(editingCar);
            setDialogOpen(true);
        }
    }, [formMode, editingCar]);

    const openCreate = () => {
        setDialogCar(null);
        setDialogMode('create');
        setDialogOpen(true);
    };

    const openCar = useCallback(
        (id: number) => {
            const canUpdate = estPravo('cars.update');
            const canView = estPravo('cars.view');

            if (!canUpdate && !canView) {
                return;
            }

            fetch(route('cars.form-data', id), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error('Не удалось загрузить автомобиль');
                    }

                    return response.json() as Promise<{
                        mode: 'edit' | 'view';
                        car: CarEditPayload;
                    }>;
                })
                .then((payload) => {
                    setDialogCar(payload.car);
                    setDialogMode(payload.mode);
                    setDialogOpen(true);
                })
                .catch(() => {
                    // сеть / 403 — модалку не открываем
                });
        },
        [estPravo],
    );

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
            {
                type: 'select',
                key: 'transmission_id',
                label: 'КПП',
                value: asFilterString(filters.transmission_id),
                options: dictionaries.transmissions.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                })),
            },
            {
                type: 'select',
                key: 'wheel_type_id',
                label: 'Привод',
                value: asFilterString(filters.wheel_type_id),
                options: dictionaries.wheelTypes.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                })),
            },
            {
                type: 'select',
                key: 'body_type_id',
                label: 'Кузов',
                value: asFilterString(filters.body_type_id),
                options: dictionaries.bodyTypes.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                })),
            },
            {
                type: 'select',
                key: 'engine_type_id',
                label: 'Двигатель',
                value: asFilterString(filters.engine_type_id),
                options: dictionaries.engineTypes.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                })),
            },
            {
                type: 'select',
                key: 'pts_type',
                label: 'ПТС',
                value: asFilterString(filters.pts_type),
                options: ptsTypes.map((item) => ({
                    value: String(item.value),
                    label: item.label,
                })),
            },
            {
                type: 'numberRange',
                key: 'year',
                label: 'Год',
                fromKey: 'year_from',
                toKey: 'year_to',
                fromValue: asFilterString(filters.year_from),
                toValue: asFilterString(filters.year_to),
                fromPlaceholder: 'От',
                toPlaceholder: 'До',
            },
            {
                type: 'dateRange',
                key: 'arrival_date',
                label: 'Приход',
                fromKey: 'arrival_date_from',
                toKey: 'arrival_date_to',
                fromValue: filters.arrival_date_from,
                toValue: filters.arrival_date_to,
            },
        ],
        [dictionaries, filters, ptsTypes, selectedMark?.label, selectedModel?.label],
    );

    const columns = useMemo<ColumnDef<CarRow>[]>(
        () => [
            {
                accessorKey: 'arrival_date',
                meta: { label: 'Дата прихода' },
                header: 'Приход',
                cell: ({ row }) => <CellText value={row.original.arrival_date} />,
            },
            {
                accessorKey: 'showroom',
                meta: { label: 'Салон' },
                header: 'Салон',
                cell: ({ row }) => <CellText value={row.original.showroom} />,
            },
            {
                accessorKey: 'mark',
                meta: { label: 'Марка' },
                header: 'Марка',
                cell: ({ row }) => <CellText value={row.original.mark} className="font-medium" />,
            },
            {
                accessorKey: 'model',
                meta: { label: 'Модель' },
                header: 'Модель',
                cell: ({ row }) => <CellText value={row.original.model} />,
            },
            {
                accessorKey: 'year',
                meta: { label: 'Год' },
                header: 'Год',
                cell: ({ row }) => <CellText value={row.original.year} />,
            },
            {
                accessorKey: 'complectation',
                meta: { label: 'Комплектация' },
                header: 'Комплектация',
                cell: ({ row }) => <CellText value={row.original.complectation} />,
            },
            {
                accessorKey: 'body_type',
                meta: { label: 'Кузов' },
                header: 'Кузов',
                cell: ({ row }) => <CellText value={row.original.body_type} />,
            },
            {
                accessorKey: 'wheel_type',
                meta: { label: 'Привод' },
                header: 'Привод',
                cell: ({ row }) => <CellText value={row.original.wheel_type} />,
            },
            {
                accessorKey: 'transmission',
                meta: { label: 'КПП' },
                header: 'КПП',
                cell: ({ row }) => <CellText value={row.original.transmission} />,
            },
            {
                id: 'volume_power',
                meta: { label: 'Объём (л.с.)' },
                header: 'Объём (л.с.)',
                cell: ({ row }) => (
                    <CellVolumePower volume={row.original.engine_volume} power={row.original.power} />
                ),
            },
            {
                accessorKey: 'engine_type',
                meta: { label: 'Двигатель' },
                header: 'Двигатель',
                cell: ({ row }) => <CellText value={row.original.engine_type} />,
            },
            {
                accessorKey: 'color',
                meta: { label: 'Цвет' },
                header: 'Цвет',
                cell: ({ row }) => <CellText value={row.original.color} />,
            },
            {
                accessorKey: 'vin',
                meta: { label: 'VIN' },
                header: 'VIN',
                cell: ({ row }) => <CellText value={row.original.vin} className="font-mono text-[11px]" />,
            },
            {
                accessorKey: 'body_number',
                meta: { label: 'Номер кузова' },
                header: '№ кузова',
                cell: ({ row }) => (
                    <CellText value={row.original.body_number} className="font-mono text-[11px]" />
                ),
            },
            {
                accessorKey: 'price',
                meta: { label: 'Цена' },
                header: 'Цена',
                cell: ({ row }) => <CellMoney value={row.original.price} />,
            },
            {
                accessorKey: 'sale_price',
                meta: { label: 'Продажа' },
                header: 'Продажа',
                cell: ({ row }) => <CellMoney value={row.original.sale_price} />,
            },
            {
                accessorKey: 'pts_label',
                meta: { label: 'ПТС' },
                header: 'ПТС',
                cell: ({ row }) => <CellText value={row.original.pts_label} />,
            },
            {
                accessorKey: 'key_number',
                meta: { label: 'Номер ключа' },
                header: 'Ключ',
                cell: ({ row }) => <CellText value={row.original.key_number} />,
            },
            {
                id: 'status',
                meta: { label: 'Статус' },
                header: 'Статус',
                cell: ({ row }) => <CellText value={row.original.status?.name} className="font-medium" />,
            },
            {
                id: 'link',
                meta: { label: 'Ссылка' },
                header: 'Ссылка',
                cell: ({ row }) => <CellExternalLink url={row.original.link} label="Открыть ссылку" />,
            },
        ],
        [],
    );

    const getRowStyle = useCallback((row: CarRow): CSSProperties | undefined => {
        if (!row.status?.color) {
            return undefined;
        }

        return {
            backgroundColor: row.status.color,
            color: row.status.text_color || '#FFFFFF',
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Новые авто" />

            <AppPageContent title="Новые авто" description="Учёт новых автомобилей">
                <InertiaDataTable
                    columns={columns}
                    paginator={cars}
                    search={state.search}
                    searchPlaceholder="Поиск по VIN или номеру кузова"
                    onSearch={setSearch}
                    onPerPageChange={setLimit}
                    filterFields={filterFields}
                    onFilterChange={setFilter}
                    onFiltersChange={applyFilters}
                    onResetFilters={resetFilters}
                    cellBorders
                    getRowStyle={getRowStyle}
                    onRowClick={
                        estPravo('cars.view') || estPravo('cars.update') ? (row) => openCar(row.id) : undefined
                    }
                    toolbar={
                        estPravo('cars.create') ? (
                            <Button size="sm" className="h-8" type="button" onClick={openCreate}>
                                <Plus className="mr-1.5 size-3.5" />
                                Добавить
                            </Button>
                        ) : undefined
                    }
                />
            </AppPageContent>

            {dialogMode ? (
                <CarFormDialog
                    open={dialogOpen}
                    mode={dialogMode}
                    car={dialogMode === 'create' ? null : dialogCar}
                    dictionaries={dictionaries}
                    ptsTypes={ptsTypes}
                    onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) {
                            setDialogMode(null);
                            setDialogCar(null);
                        }
                    }}
                />
            ) : null}
        </AppLayout>
    );
}
