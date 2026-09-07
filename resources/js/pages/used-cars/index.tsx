import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import { InertiaDataTable } from '@/components/inertia-data-table/inertia-data-table';
import { type DataTableFilterField } from '@/components/inertia-data-table/types';
import {
    UsedCarFormDialog,
    type UsedCarDialogMode,
    type UsedCarEditPayload,
} from '@/components/used-cars/used-car-form-dialog';
import { type UsedCarDictionaries, type UsedCarServiceRow } from '@/components/used-cars/used-car-form';
import { Button } from '@/components/ui/button';
import {
    CellBool,
    CellExternalLink,
    CellMoney,
    CellText,
    CellVolumePower,
} from '@/components/used-cars/used-car-table-cells';
import { useDostup } from '@/hooks/use-dostup';
import { useInertiaDataTable } from '@/hooks/use-inertia-data-table';
import AppLayout from '@/layouts/app-layout';
import AppPageContent from '@/layouts/app-page-content';
import { type BreadcrumbItem } from '@/types';
import { type PaginatedCollection, type TableState } from '@/types/pagination';

interface UsedCarStatus {
    name: string;
    color: string | null;
    text_color: string | null;
}

interface UsedCarRow {
    id: number;
    arrival_date: string | null;
    showroom: string | null;
    mark: string | null;
    model: string | null;
    year: number | null;
    body_type: string | null;
    owner_count: number | null;
    mileage: number | null;
    wheel_type: string | null;
    transmission: string | null;
    engine_volume: string | null;
    power: number | null;
    engine_type: string | null;
    interior: string | null;
    color: string | null;
    vin: string | null;
    license_plate: string | null;
    sts_number: string | null;
    purchase_with_expenses: number | null;
    sale_price: number | null;
    total_expenses: number | null;
    pts_type: number | null;
    pts_label: string | null;
    is_registered: boolean | null;
    is_trade_in: boolean;
    key_number: string | null;
    legal_entity: string | null;
    status: UsedCarStatus | null;
    service_book: boolean | null;
    autoteka_url: string | null;
    avito_url: string | null;
}

interface UsedCarsFilters {
    mark_id: number | null;
    model_id: number | null;
    transmission_id: number | null;
    wheel_type_id: number | null;
    body_type_id: number | null;
    engine_type_id: number | null;
    pts_type: number | null;
    year_from: number | null;
    year_to: number | null;
    mileage_from: number | null;
    mileage_to: number | null;
    arrival_date_from: string | null;
    arrival_date_to: string | null;
    is_registered: string | null;
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
    cars: PaginatedCollection<UsedCarRow>;
    state: TableState;
    filters: UsedCarsFilters;
    selectedMark: SelectedOption | null;
    selectedModel: SelectedOption | null;
    dictionaries: UsedCarDictionaries;
    serviceStatuses: OptionItem[];
    ptsTypes: OptionItem[];
    emptyServices: UsedCarServiceRow[];
    formMode: UsedCarDialogMode | null;
    editingCar: UsedCarEditPayload | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Авто с пробегом',
        href: '/used-cars',
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
    'mileage_from',
    'mileage_to',
    'arrival_date_from',
    'arrival_date_to',
    'is_registered',
];

function asFilterString(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return String(value);
}

export default function UsedCarsIndex({
    cars,
    state,
    filters,
    selectedMark,
    selectedModel,
    dictionaries,
    serviceStatuses,
    ptsTypes,
    emptyServices,
    formMode,
    editingCar,
}: Props) {
    const { estPravo } = useDostup();
    const { setSearch, setLimit, setFilter, applyFilters, resetFilters } = useInertiaDataTable(
        state,
        filterKeys,
    );

    const [dialogOpen, setDialogOpen] = useState(
        formMode === 'create' || formMode === 'edit' || formMode === 'view',
    );
    const [dialogMode, setDialogMode] = useState<UsedCarDialogMode | null>(formMode);
    const [dialogCar, setDialogCar] = useState<UsedCarEditPayload | null>(editingCar);

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
            const canUpdate = estPravo('used_cars.update');
            const canView = estPravo('used_cars.view');

            if (!canUpdate && !canView) {
                return;
            }

            fetch(route('used-cars.form-data', id), {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error('Не удалось загрузить автомобиль');
                    }

                    return response.json() as Promise<{
                        mode: 'edit' | 'view';
                        car: UsedCarEditPayload;
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
                label: 'Коробка',
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
                type: 'numberRange',
                key: 'mileage',
                label: 'Пробег',
                fromKey: 'mileage_from',
                toKey: 'mileage_to',
                fromValue: asFilterString(filters.mileage_from),
                toValue: asFilterString(filters.mileage_to),
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
                type: 'select',
                key: 'is_registered',
                label: 'На учёте',
                value: filters.is_registered,
                options: [
                    { value: '1', label: 'Да' },
                    { value: '0', label: 'Нет' },
                ],
            },
        ],
        [dictionaries, filters, ptsTypes, selectedMark?.label, selectedModel?.label],
    );

    const columns = useMemo<ColumnDef<UsedCarRow>[]>(
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
                accessorKey: 'body_type',
                meta: { label: 'Кузов' },
                header: 'Кузов',
                cell: ({ row }) => <CellText value={row.original.body_type} />,
            },
            {
                accessorKey: 'owner_count',
                meta: { label: 'Собственников' },
                header: 'Собств.',
                cell: ({ row }) => <CellText value={row.original.owner_count} />,
            },
            {
                accessorKey: 'mileage',
                meta: { label: 'Пробег' },
                header: 'Пробег',
                cell: ({ row }) => (
                    <CellText
                        value={
                            row.original.mileage === null || row.original.mileage === undefined
                                ? null
                                : row.original.mileage.toLocaleString('ru-RU')
                        }
                    />
                ),
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
                accessorKey: 'interior',
                meta: { label: 'Отделка салона' },
                header: 'Отделка',
                cell: ({ row }) => <CellText value={row.original.interior} />,
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
                cell: ({ row }) => (
                    <CellText value={row.original.vin} className="font-mono text-[11px]" />
                ),
            },
            {
                accessorKey: 'license_plate',
                meta: { label: 'Гос. номер' },
                header: 'Гос. номер',
                cell: ({ row }) => <CellText value={row.original.license_plate} />,
            },
            {
                accessorKey: 'sts_number',
                meta: { label: 'СТС' },
                header: 'СТС',
                cell: ({ row }) => <CellText value={row.original.sts_number} />,
            },
            {
                accessorKey: 'purchase_with_expenses',
                meta: { label: 'Закупка с расходом' },
                header: 'Закупка+',
                cell: ({ row }) => <CellMoney value={row.original.purchase_with_expenses} />,
            },
            {
                accessorKey: 'sale_price',
                meta: { label: 'Продажа' },
                header: 'Продажа',
                cell: ({ row }) => <CellMoney value={row.original.sale_price} />,
            },
            {
                accessorKey: 'total_expenses',
                meta: { label: 'Расходы' },
                header: 'Расходы',
                cell: ({ row }) => <CellMoney value={row.original.total_expenses} />,
            },
            {
                accessorKey: 'pts_label',
                meta: { label: 'ПТС' },
                header: 'ПТС',
                cell: ({ row }) => <CellText value={row.original.pts_label} />,
            },
            {
                accessorKey: 'is_registered',
                meta: { label: 'На учёте' },
                header: 'Учёт',
                cell: ({ row }) => <CellBool value={row.original.is_registered} />,
            },
            {
                accessorKey: 'is_trade_in',
                meta: { label: 'Trade-in' },
                header: 'Trade-in',
                cell: ({ row }) => <CellBool value={row.original.is_trade_in} />,
            },
            {
                accessorKey: 'key_number',
                meta: { label: 'Номер ключа' },
                header: 'Ключ',
                cell: ({ row }) => <CellText value={row.original.key_number} />,
            },
            {
                accessorKey: 'legal_entity',
                meta: { label: 'Юр. лицо' },
                header: 'Юр. лицо',
                cell: ({ row }) => <CellText value={row.original.legal_entity} />,
            },
            {
                id: 'status',
                meta: { label: 'Статус' },
                header: 'Статус',
                cell: ({ row }) => <CellText value={row.original.status?.name} className="font-medium" />,
            },
            {
                accessorKey: 'service_book',
                meta: { label: 'Сервисная книжка' },
                header: 'Серв. кн.',
                cell: ({ row }) => <CellBool value={row.original.service_book} />,
            },
            {
                id: 'autoteka',
                meta: { label: 'Автотека' },
                header: 'Автотека',
                cell: ({ row }) => (
                    <CellExternalLink url={row.original.autoteka_url} label="Открыть Автотеку" />
                ),
            },
            {
                id: 'avito',
                meta: { label: 'Авито' },
                header: 'Авито',
                cell: ({ row }) => (
                    <CellExternalLink url={row.original.avito_url} label="Открыть Авито" />
                ),
            },
        ],
        [],
    );

    const getRowStyle = useCallback((row: UsedCarRow): CSSProperties | undefined => {
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
            <Head title="Авто с пробегом" />

            <AppPageContent title="Авто с пробегом" description="Учёт автомобилей с пробегом">
                <InertiaDataTable
                    columns={columns}
                    paginator={cars}
                    search={state.search}
                    searchPlaceholder="Поиск по VIN или госномеру"
                    onSearch={setSearch}
                    onPerPageChange={setLimit}
                    filterFields={filterFields}
                    onFilterChange={setFilter}
                    onFiltersChange={applyFilters}
                    onResetFilters={resetFilters}
                    cellBorders
                    getRowStyle={getRowStyle}
                    onRowClick={
                        estPravo('used_cars.view') || estPravo('used_cars.update')
                            ? (row) => openCar(row.id)
                            : undefined
                    }
                    toolbar={
                        estPravo('used_cars.create') ? (
                            <Button size="sm" className="h-8" type="button" onClick={openCreate}>
                                <Plus className="mr-1.5 size-3.5" />
                                Добавить
                            </Button>
                        ) : undefined
                    }
                />
            </AppPageContent>

            {dialogMode ? (
                <UsedCarFormDialog
                    open={dialogOpen}
                    mode={dialogMode}
                    car={dialogMode === 'create' ? null : dialogCar}
                    emptyServices={emptyServices}
                    dictionaries={dictionaries}
                    serviceStatuses={serviceStatuses}
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
