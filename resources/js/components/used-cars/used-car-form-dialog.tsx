import { type FormDataConvertible } from '@inertiajs/core';
import { router, useForm } from '@inertiajs/react';
import { type FormEvent, useMemo } from 'react';

import { todayIsoDate } from '@/components/date-picker-field';
import { EntityActivityHistoryButton } from '@/components/entity-activity-history';
import { OverlayPortalContainer } from '@/components/overlay-portal-container';
import {
    UsedCarFormFields,
    normalizeUsedCarFormData,
    type UsedCarDictionaries,
    type UsedCarFormData,
    type UsedCarServiceRow,
} from '@/components/used-cars/used-car-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfirmAction } from '@/hooks/use-confirm-action';
import { useDostup } from '@/hooks/use-dostup';
import { safeRoute } from '@/lib/safe-route';

interface OptionItem {
    value: number;
    label: string;
}

export interface UsedCarEditPayload {
    id: number;
    showroom_id: number | null;
    arrival_date: string | null;
    mark_id: number | null;
    model_id: number | null;
    year: number | null;
    body_type_id: number | null;
    transmission_id: number | null;
    engine_type_id: number | null;
    wheel_type_id: number | null;
    color: string | null;
    interior_type_id: number | null;
    owner_count: number | null;
    power: number | null;
    mileage: number | null;
    engine_volume: string | null;
    vin: string | null;
    license_plate: string | null;
    sts_number: string | null;
    pts_type: number | null;
    is_registered: boolean | null;
    key_number: string | null;
    legal_entity: string | null;
    service_book: boolean | null;
    is_trade_in: boolean;
    status_id: number | null;
    purchase_price: number | null;
    sale_price: number | null;
    avito_price: number | null;
    repair_cost: number | null;
    transport_cost: number | null;
    deregistration_cost: number | null;
    avito_url: string | null;
    autoteka_url: string | null;
    sale_type: string | null;
    comment: string | null;
    is_trashed?: boolean;
    services: UsedCarServiceRow[];
    selected: {
        mark: { id: number; label: string } | null;
        model: { id: number; label: string } | null;
    };
}

export type UsedCarDialogMode = 'create' | 'edit' | 'view';

interface Props {
    open: boolean;
    mode: UsedCarDialogMode | null;
    car: UsedCarEditPayload | null;
    emptyServices: UsedCarServiceRow[];
    dictionaries: UsedCarDictionaries;
    serviceStatuses: OptionItem[];
    ptsTypes: OptionItem[];
    onOpenChange: (open: boolean) => void;
}

function asInputValue(value: string | number | null | undefined): string | number {
    return value === null || value === undefined ? '' : value;
}

function emptyFormData(services: UsedCarServiceRow[]): UsedCarFormData {
    return normalizeUsedCarFormData({
        showroom_id: null,
        arrival_date: todayIsoDate(),
        mark_id: null,
        model_id: null,
        year: '',
        body_type_id: null,
        transmission_id: null,
        engine_type_id: null,
        wheel_type_id: null,
        color: '',
        interior_type_id: null,
        owner_count: 1,
        power: '',
        mileage: '',
        engine_volume: '',
        vin: '',
        license_plate: '',
        sts_number: '',
        pts_type: null,
        is_registered: false,
        key_number: '',
        legal_entity: '',
        service_book: false,
        is_trade_in: false,
        status_id: null,
        purchase_price: '',
        sale_price: '',
        avito_price: '',
        repair_cost: '',
        transport_cost: '',
        deregistration_cost: '',
        avito_url: '',
        autoteka_url: '',
        sale_type: '',
        comment: '',
        services,
    });
}

function toFormData(car: UsedCarEditPayload): UsedCarFormData {
    return normalizeUsedCarFormData({
        showroom_id: car.showroom_id,
        arrival_date: car.arrival_date ?? '',
        mark_id: car.mark_id,
        model_id: car.model_id,
        year: asInputValue(car.year),
        body_type_id: car.body_type_id,
        transmission_id: car.transmission_id,
        engine_type_id: car.engine_type_id,
        wheel_type_id: car.wheel_type_id,
        color: car.color ?? '',
        interior_type_id: car.interior_type_id,
        owner_count: car.owner_count && car.owner_count > 0 ? car.owner_count : 1,
        power: asInputValue(car.power),
        mileage: asInputValue(car.mileage),
        engine_volume: car.engine_volume ?? '',
        vin: car.vin ?? '',
        license_plate: car.license_plate ?? '',
        sts_number: car.sts_number ?? '',
        pts_type: car.pts_type && [1, 2, 3].includes(car.pts_type) ? car.pts_type : null,
        is_registered: car.is_registered ?? false,
        key_number: car.key_number ?? '',
        legal_entity: car.legal_entity ?? '',
        service_book: car.service_book ?? false,
        is_trade_in: Boolean(car.is_trade_in),
        status_id: car.status_id,
        purchase_price: asInputValue(car.purchase_price),
        sale_price: asInputValue(car.sale_price),
        avito_price: asInputValue(car.avito_price),
        repair_cost: asInputValue(car.repair_cost),
        transport_cost: asInputValue(car.transport_cost),
        deregistration_cost: asInputValue(car.deregistration_cost),
        avito_url: car.avito_url ?? '',
        autoteka_url: car.autoteka_url ?? '',
        sale_type: car.sale_type ?? '',
        comment: car.comment ?? '',
        services: car.services ?? [],
    });
}

function closeAndNormalizeUrl(onOpenChange: (open: boolean) => void) {
    onOpenChange(false);

    // Если открыли по прямому URL (/create, /edit, /:id) — вернуть на список без смены history при обычном клике.
    if (typeof window !== 'undefined' && window.location.pathname !== '/used-cars') {
        window.history.replaceState(window.history.state, '', '/used-cars');
    }
}

interface FormBodyProps {
    formKey: string;
    mode: UsedCarDialogMode;
    car: UsedCarEditPayload | null;
    emptyServices: UsedCarServiceRow[];
    dictionaries: UsedCarDictionaries;
    serviceStatuses: OptionItem[];
    ptsTypes: OptionItem[];
    onClose: () => void;
}

function UsedCarFormDialogBody({
    formKey,
    mode,
    car,
    emptyServices,
    dictionaries,
    serviceStatuses,
    ptsTypes,
    onClose,
}: FormBodyProps) {
    const isView = mode === 'view';
    const { estPravo, estRol } = useDostup();
    const { confirmAction, ConfirmActionModal } = useConfirmAction();
    const canManageTrash = estRol('administrator') || estPravo('used_cars.delete');
    const isTrashed = Boolean(car?.is_trashed);
    const initialData =
        (mode === 'edit' || mode === 'view') && car ? toFormData(car) : emptyFormData(emptyServices);

    const form = useForm({
        ...initialData,
        services: initialData.services as unknown as FormDataConvertible,
    });

    const normalizedData = useMemo(
        () => normalizeUsedCarFormData(form.data as unknown as UsedCarFormData),
        [form.data],
    );

    const carTitle =
        [car?.selected.mark?.label, car?.selected.model?.label, car?.year].filter(Boolean).join(' ') || 'автомобиль';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isView || isTrashed) {
            return;
        }

        if (mode === 'edit' && car) {
            form.put(route('used-cars.update', car.id), {
                preserveScroll: true,
                onSuccess: onClose,
            });

            return;
        }

        form.post(route('used-cars.store'), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const handleDelete = async () => {
        if (!car) {
            return;
        }

        const confirmed = await confirmAction({
            title: 'Переместить в удалённые?',
            description: `«${carTitle}» будет перемещён в удалённые. Запись можно будет восстановить.`,
            confirmLabel: 'Удалить',
            cancelLabel: 'Отмена',
            variant: 'destructive',
        });

        if (!confirmed) {
            return;
        }

        router.delete(route('used-cars.destroy', car.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const handleRestore = async () => {
        if (!car) {
            return;
        }

        const confirmed = await confirmAction({
            title: 'Восстановить автомобиль?',
            description: `«${carTitle}» снова появится в списке активных записей.`,
            confirmLabel: 'Восстановить',
            cancelLabel: 'Отмена',
        });

        if (!confirmed) {
            return;
        }

        router.post(
            route('used-cars.restore', car.id),
            {},
            {
                preserveScroll: true,
                onSuccess: onClose,
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <OverlayPortalContainer>
                <ScrollArea className="-mx-4 h-[min(65vh,720px)] px-4">
                    <div className="p-1">
                        <UsedCarFormFields
                            formKey={formKey}
                            data={normalizedData}
                            setData={form.setData}
                            errors={form.errors}
                            dictionaries={dictionaries}
                            serviceStatuses={serviceStatuses}
                            ptsTypes={ptsTypes}
                            selected={mode === 'create' ? undefined : car?.selected}
                            readOnly={isView || isTrashed}
                        />
                    </div>
                </ScrollArea>
            </OverlayPortalContainer>

            <DialogFooter className="sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {mode !== 'create' && car ? (
                        <>
                            <EntityActivityHistoryButton url={safeRoute('used-cars.activities', car.id)} />
                            {canManageTrash && !isTrashed ? (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={form.processing}
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </Button>
                            ) : null}
                            {canManageTrash && isTrashed ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={form.processing}
                                    onClick={handleRestore}
                                >
                                    Восстановить
                                </Button>
                            ) : null}
                        </>
                    ) : (
                        <span />
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={form.processing}>
                            {isView || isTrashed ? 'Закрыть' : 'Отмена'}
                        </Button>
                    </DialogClose>
                    {!isView && !isTrashed ? (
                        <Button type="submit" disabled={form.processing}>
                            {mode === 'edit' ? 'Сохранить' : 'Добавить'}
                        </Button>
                    ) : null}
                </div>
            </DialogFooter>

            <ConfirmActionModal />
        </form>
    );
}

export function UsedCarFormDialog({
    open,
    mode,
    car,
    emptyServices,
    dictionaries,
    serviceStatuses,
    ptsTypes,
    onOpenChange,
}: Props) {
    if (!mode) {
        return null;
    }

    const formKey =
        mode === 'create' ? 'create' : car ? `${mode}-${car.id}` : mode;
    const handleClose = () => closeAndNormalizeUrl(onOpenChange);
    const isCarLoading = (mode === 'edit' || mode === 'view') && !car;

    const carTitle =
        [car?.selected.mark?.label, car?.selected.model?.label, car?.year].filter(Boolean).join(' ') || null;

    const title =
        mode === 'create'
            ? 'Новый автомобиль'
            : mode === 'view'
              ? carTitle || 'Просмотр'
              : carTitle || 'Редактирование';

    const description =
        mode === 'create'
            ? 'Добавление автомобиля с пробегом'
            : mode === 'view'
              ? 'Просмотр автомобиля с пробегом'
              : 'Изменение автомобиля с пробегом';

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    handleClose();
                    return;
                }

                onOpenChange(next);
            }}
        >
            <DialogContent className="sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {isCarLoading ? (
                    <p className="text-muted-foreground text-sm">Загрузка…</p>
                ) : (
                    <UsedCarFormDialogBody
                        key={formKey}
                        formKey={formKey}
                        mode={mode}
                        car={car}
                        emptyServices={emptyServices}
                        dictionaries={dictionaries}
                        serviceStatuses={serviceStatuses}
                        ptsTypes={ptsTypes}
                        onClose={handleClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
