import { useForm, router } from '@inertiajs/react';
import { type FormEvent, useMemo } from 'react';

import {
    CarFormFields,
    normalizeCarFormData,
    type CarDictionaries,
    type CarFormData,
} from '@/components/cars/car-form';
import { todayIsoDate } from '@/components/date-picker-field';
import { EntityActivityHistoryButton } from '@/components/entity-activity-history';
import { OverlayPortalContainer } from '@/components/overlay-portal-container';
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

export interface CarEditPayload {
    id: number;
    showroom_id: number | null;
    arrival_date: string | null;
    mark_id: number | null;
    model_id: number | null;
    year: number | null;
    complectation: string | null;
    body_type_id: number | null;
    transmission_id: number | null;
    engine_type_id: number | null;
    wheel_type_id: number | null;
    engine_volume: string | null;
    power: number | null;
    color: string | null;
    salon: string | null;
    interior_type_id: number | null;
    vin: string | null;
    body_number: string | null;
    pts_type: number | null;
    key_number: string | null;
    status_id: number | null;
    price: number | null;
    sale_price: number | null;
    avito_price: number | null;
    transport_cost: number | null;
    repair_cost: number | null;
    deregistration_cost: number | null;
    supplier: string | null;
    avito_url: string | null;
    autoteka_url: string | null;
    link: string | null;
    comment: string | null;
    is_trashed?: boolean;
    selected: {
        mark: { id: number; label: string } | null;
        model: { id: number; label: string } | null;
    };
}

export type CarDialogMode = 'create' | 'edit' | 'view';

interface Props {
    open: boolean;
    mode: CarDialogMode | null;
    car: CarEditPayload | null;
    dictionaries: CarDictionaries;
    ptsTypes: OptionItem[];
    onOpenChange: (open: boolean) => void;
}

function asInputValue(value: string | number | null | undefined): string | number {
    return value === null || value === undefined ? '' : value;
}

function emptyFormData(): CarFormData {
    return normalizeCarFormData({
        showroom_id: null,
        arrival_date: todayIsoDate(),
        mark_id: null,
        model_id: null,
        year: '',
        complectation: '',
        body_type_id: null,
        transmission_id: null,
        engine_type_id: null,
        wheel_type_id: null,
        engine_volume: '',
        power: '',
        color: '',
        salon: '',
        interior_type_id: null,
        vin: '',
        body_number: '',
        pts_type: null,
        key_number: '',
        status_id: null,
        price: '',
        sale_price: '',
        avito_price: '',
        transport_cost: '',
        repair_cost: '',
        deregistration_cost: '',
        supplier: '',
        avito_url: '',
        autoteka_url: '',
        comment: '',
    });
}

function toFormData(car: CarEditPayload): CarFormData {
    return normalizeCarFormData({
        showroom_id: car.showroom_id,
        arrival_date: car.arrival_date ?? '',
        mark_id: car.mark_id,
        model_id: car.model_id,
        year: asInputValue(car.year),
        complectation: car.complectation ?? '',
        body_type_id: car.body_type_id,
        transmission_id: car.transmission_id,
        engine_type_id: car.engine_type_id,
        wheel_type_id: car.wheel_type_id,
        engine_volume: car.engine_volume ?? '',
        power: asInputValue(car.power),
        color: car.color ?? '',
        salon: car.salon ?? '',
        interior_type_id: car.interior_type_id,
        vin: car.vin ?? '',
        body_number: car.body_number ?? '',
        pts_type: car.pts_type === null || car.pts_type === undefined ? null : car.pts_type,
        key_number: car.key_number ?? '',
        status_id: car.status_id,
        price: asInputValue(car.price),
        sale_price: asInputValue(car.sale_price),
        avito_price: asInputValue(car.avito_price),
        transport_cost: asInputValue(car.transport_cost),
        repair_cost: asInputValue(car.repair_cost),
        deregistration_cost: asInputValue(car.deregistration_cost),
        supplier: car.supplier ?? '',
        avito_url: car.avito_url ?? car.link ?? '',
        autoteka_url: car.autoteka_url ?? '',
        comment: car.comment ?? '',
    });
}

function closeAndNormalizeUrl(onOpenChange: (open: boolean) => void) {
    onOpenChange(false);

    if (typeof window !== 'undefined' && window.location.pathname !== '/cars') {
        window.history.replaceState(window.history.state, '', '/cars');
    }
}

interface FormBodyProps {
    formKey: string;
    mode: CarDialogMode;
    car: CarEditPayload | null;
    dictionaries: CarDictionaries;
    ptsTypes: OptionItem[];
    onClose: () => void;
}

function CarFormDialogBody({ formKey, mode, car, dictionaries, ptsTypes, onClose }: FormBodyProps) {
    const isView = mode === 'view';
    const { estPravo, estRol } = useDostup();
    const { confirmAction, ConfirmActionModal } = useConfirmAction();
    const canManageTrash = estRol('administrator') || estPravo('cars.delete');
    const isTrashed = Boolean(car?.is_trashed);
    const initialData = (mode === 'edit' || mode === 'view') && car ? toFormData(car) : emptyFormData();

    const form = useForm({ ...initialData });

    const normalizedData = useMemo(() => normalizeCarFormData(form.data), [form.data]);

    const carTitle =
        [car?.selected.mark?.label, car?.selected.model?.label, car?.year].filter(Boolean).join(' ') || 'автомобиль';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isView || isTrashed) {
            return;
        }

        if (mode === 'edit' && car) {
            form.put(route('cars.update', car.id), {
                preserveScroll: true,
                onSuccess: onClose,
            });

            return;
        }

        form.post(route('cars.store'), {
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

        router.delete(route('cars.destroy', car.id), {
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
            route('cars.restore', car.id),
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
                        <CarFormFields
                            formKey={formKey}
                            data={normalizedData}
                            setData={form.setData}
                            errors={form.errors}
                            dictionaries={dictionaries}
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
                            <EntityActivityHistoryButton url={safeRoute('cars.activities', car.id)} />
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
                    ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={form.processing}>
                            {isView || isTrashed ? 'Закрыть' : 'Отмена'}
                        </Button>
                    </DialogClose>
                    {!isView && !isTrashed ? (
                        <Button type="submit" disabled={form.processing}>
                            Сохранить
                        </Button>
                    ) : null}
                </div>
            </DialogFooter>

            <ConfirmActionModal />
        </form>
    );
}

export function CarFormDialog({ open, mode, car, dictionaries, ptsTypes, onOpenChange }: Props) {
    if (!mode) {
        return null;
    }

    const formKey = mode === 'create' ? 'create' : car ? `${mode}-${car.id}` : mode;
    const handleClose = () => closeAndNormalizeUrl(onOpenChange);
    const isCarLoading = (mode === 'edit' || mode === 'view') && !car;

    const carTitle =
        [car?.selected.mark?.label, car?.selected.model?.label, car?.year].filter(Boolean).join(' ') || null;

    const title =
        mode === 'create'
            ? 'Добавление нового автомобиля'
            : mode === 'view'
              ? 'Просмотр нового автомобиля'
              : 'Изменение нового автомобиля';

    const description = mode === 'create' ? 'Новый автомобиль в наличии или в пути' : carTitle || 'Новый автомобиль';

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
                    <CarFormDialogBody
                        key={formKey}
                        formKey={formKey}
                        mode={mode}
                        car={car}
                        dictionaries={dictionaries}
                        ptsTypes={ptsTypes}
                        onClose={handleClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
