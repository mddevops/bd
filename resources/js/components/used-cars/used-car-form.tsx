import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { CatalogSearchSelect } from '@/components/catalog/catalog-search-select';
import { DatePickerField } from '@/components/date-picker-field';
import { EngineVolumeSelect } from '@/components/engine-volume-select';
import { FormSectionCard } from '@/components/form-section-card';
import InputError from '@/components/input-error';
import { StaticSearchCombobox } from '@/components/search-combobox';
import { ColorNameSelect } from '@/components/used-cars/color-name-select';
import {
    ServiceRowMotion,
    ServiceSectionCollapsible,
} from '@/components/used-cars/service-section-collapsible';
import {
    NumberField,
    NumberFieldDecrement,
    NumberFieldGroup,
    NumberFieldIncrement,
    NumberFieldInput,
    NumberFieldScrubArea,
} from '@/components/reui/number-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SwitchActiveCard } from '@/components/shadcn-space/switch/switch-active-card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface UsedCarServiceRow {
    type: string;
    label: string;
    status: number;
    cost: number | null;
    comment: string | null;
}

export interface UsedCarFormData {
    showroom_id: number | null;
    arrival_date: string;
    mark_id: number | null;
    model_id: number | null;
    year: number | string;
    body_type_id: number | null;
    transmission_id: number | null;
    engine_type_id: number | null;
    wheel_type_id: number | null;
    color: string;
    interior_type_id: number | null;
    owner_count: number | string;
    power: number | string;
    mileage: number | string;
    engine_volume: string;
    vin: string;
    license_plate: string;
    sts_number: string;
    pts_type: number | null;
    is_registered: boolean | null;
    key_number: string;
    legal_entity: string;
    service_book: boolean | null;
    is_trade_in: boolean;
    status_id: number | null;
    purchase_price: number | string;
    sale_price: number | string;
    avito_price: number | string;
    repair_cost: number | string;
    transport_cost: number | string;
    deregistration_cost: number | string;
    avito_url: string;
    autoteka_url: string;
    sale_type: string;
    comment: string;
    services: UsedCarServiceRow[];
}

interface ColorDictionaryItem {
    id: number;
    name: string;
    hex?: string;
}

interface DictionaryItem {
    id: number;
    name: string;
    color?: string | null;
}

interface OptionItem {
    value: number;
    label: string;
}

export interface UsedCarDictionaries {
    showrooms: DictionaryItem[];
    bodyTypes: DictionaryItem[];
    transmissions: DictionaryItem[];
    engineTypes: DictionaryItem[];
    wheelTypes: DictionaryItem[];
    colors: ColorDictionaryItem[];
    interiorTypes: DictionaryItem[];
    statuses: DictionaryItem[];
}

interface SelectedLabels {
    mark: { id: number; label: string } | null;
    model: { id: number; label: string } | null;
}

interface Props {
    data: UsedCarFormData;
    setData: <K extends keyof UsedCarFormData>(key: K, value: UsedCarFormData[K]) => void;
    errors: Partial<Record<keyof UsedCarFormData | `services.${number}.${string}`, string>>;
    dictionaries: UsedCarDictionaries;
    serviceStatuses: OptionItem[];
    ptsTypes: OptionItem[];
    selected?: SelectedLabels;
    formKey?: string | number;
    readOnly?: boolean;
}

const row3 = 'grid grid-cols-1 gap-2 sm:grid-cols-3';
const row4 = 'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4';
const row2 = 'grid grid-cols-1 gap-2 sm:grid-cols-2';

function inputValue(value: string | number | null | undefined): string | number {
    return value === null || value === undefined ? '' : value;
}

export function normalizeUsedCarFormData(data: UsedCarFormData): UsedCarFormData {
    return {
        ...data,
        arrival_date: inputValue(data.arrival_date) as string,
        year: inputValue(data.year),
        mileage: inputValue(data.mileage),
        power: inputValue(data.power),
        engine_volume: inputValue(data.engine_volume) as string,
        color: inputValue(data.color) as string,
        vin: inputValue(data.vin) as string,
        license_plate: inputValue(data.license_plate) as string,
        sts_number: inputValue(data.sts_number) as string,
        legal_entity: inputValue(data.legal_entity) as string,
        key_number: inputValue(data.key_number) as string,
        purchase_price: inputValue(data.purchase_price),
        sale_price: inputValue(data.sale_price),
        avito_price: inputValue(data.avito_price),
        repair_cost: inputValue(data.repair_cost),
        transport_cost: inputValue(data.transport_cost),
        deregistration_cost: inputValue(data.deregistration_cost),
        avito_url: inputValue(data.avito_url) as string,
        autoteka_url: inputValue(data.autoteka_url) as string,
        sale_type: inputValue(data.sale_type) as string,
        comment: inputValue(data.comment) as string,
        owner_count:
            data.owner_count === null || data.owner_count === undefined || data.owner_count === ''
                ? 1
                : data.owner_count,
        services: (data.services ?? []).map((service) => ({
            ...service,
            cost: service.cost ?? null,
            comment: service.comment ?? '',
        })),
    };
}

function formatMoney(value: number): string {
    return value.toLocaleString('ru-RU');
}

function parseOptionalInt(raw: string): number | '' {
    if (raw === '') {
        return '';
    }

    const parsed = Number.parseInt(raw, 10);

    if (Number.isNaN(parsed) || parsed < 0) {
        return 0;
    }

    return parsed;
}

function dictionaryOptions(items: DictionaryItem[], emptyLabel = 'Не выбрано') {
    return [
        { value: '', label: emptyLabel },
        ...items.map((item) => ({
            value: String(item.id),
            label: item.name,
            color: item.color ?? null,
        })),
    ];
}

function optionItems(options: OptionItem[], emptyLabel = 'Не выбрано') {
    return [{ value: '', label: emptyLabel }, ...options.map((item) => ({ value: String(item.value), label: item.label }))];
}

function Field({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid content-start gap-2', className)}>{children}</div>;
}

function DictionarySelect({
    label,
    value,
    items,
    onChange,
    error,
    className,
    required = false,
}: {
    label: string;
    value: number | null;
    items: DictionaryItem[];
    onChange: (value: number | null) => void;
    error?: string;
    className?: string;
    required?: boolean;
}) {
    const options = useMemo(() => dictionaryOptions(items), [items]);

    return (
        <Field className={className}>
            <StaticSearchCombobox
                label={label}
                value={value ? String(value) : ''}
                options={options}
                onChange={(next) => onChange(next === '' ? null : Number(next))}
                required={required}
            />
            <InputError message={error} />
        </Field>
    );
}

export function UsedCarFormFields({
    data,
    setData,
    errors,
    dictionaries,
    serviceStatuses,
    ptsTypes,
    selected,
    formKey,
    readOnly = false,
}: Props) {
    const [markLabel, setMarkLabel] = useState<string | null>(selected?.mark?.label ?? null);
    const [modelLabel, setModelLabel] = useState<string | null>(selected?.model?.label ?? null);

    useEffect(() => {
        setMarkLabel(selected?.mark?.label ?? null);
        setModelLabel(selected?.model?.label ?? null);
    }, [formKey, selected?.mark?.label, selected?.model?.label]);

    const servicesCost = useMemo(
        () => data.services.reduce((sum, service) => sum + (Number(service.cost) || 0), 0),
        [data.services],
    );

    const totalExpenses =
        servicesCost +
        (Number(data.repair_cost) || 0) +
        (Number(data.transport_cost) || 0) +
        (Number(data.deregistration_cost) || 0);

    const purchaseWithExpenses = (Number(data.purchase_price) || 0) + totalExpenses;

    const ptsOptions = useMemo(
        () => [
            { value: '', label: 'Не выбрано' },
            ...ptsTypes.map((item) => ({ value: String(item.value), label: item.label })),
        ],
        [ptsTypes],
    );
    const serviceStatusOptions = useMemo(() => optionItems(serviceStatuses, '—'), [serviceStatuses]);

    const updateService = (index: number, patch: Partial<UsedCarServiceRow>) => {
        const next = data.services.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
        setData('services', next);
    };

    return (
        <fieldset disabled={readOnly} className="min-w-0 space-y-3 border-0 p-0 disabled:opacity-90">
            <FormSectionCard title="Автомобиль">
                <div className="space-y-2">
                    <div className={row3}>
                        <Field>
                            <CatalogSearchSelect
                                label="Марка"
                                resource="marks"
                                value={data.mark_id}
                                selectedLabel={markLabel}
                                required
                                onChange={(value, option) => {
                                    setData('mark_id', value);
                                    setData('model_id', null);
                                    setMarkLabel(option?.label ?? null);
                                    setModelLabel(null);
                                }}
                            />
                            <InputError message={errors.mark_id} />
                        </Field>

                        <Field>
                            <CatalogSearchSelect
                                label="Модель"
                                resource="models"
                                value={data.model_id}
                                selectedLabel={modelLabel}
                                filters={{ mark_id: data.mark_id }}
                                disabled={!data.mark_id}
                                required
                                onChange={(value, option) => {
                                    setData('model_id', value);
                                    setModelLabel(option?.label ?? null);
                                }}
                            />
                            <InputError message={errors.model_id} />
                        </Field>

                        <Field>
                            <Label htmlFor="year">
                                Год <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="year"
                                type="number"
                                min={1950}
                                value={inputValue(data.year)}
                                onChange={(e) => setData('year', parseOptionalInt(e.target.value))}
                                required
                            />
                            <InputError message={errors.year} />
                        </Field>
                    </div>

                    <div className={row4}>
                        <Field>
                            <Label htmlFor="mileage">
                                Пробег, км <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="mileage"
                                type="number"
                                min={0}
                                value={inputValue(data.mileage)}
                                onChange={(e) => setData('mileage', parseOptionalInt(e.target.value))}
                                required
                            />
                            <InputError message={errors.mileage} />
                        </Field>

                        <DictionarySelect
                            label="Салон"
                            value={data.showroom_id}
                            items={dictionaries.showrooms}
                            onChange={(value) => setData('showroom_id', value)}
                            error={errors.showroom_id}
                        />

                        <Field>
                            <DatePickerField
                                id="arrival_date"
                                label="Дата поступления"
                                value={inputValue(data.arrival_date) as string}
                                onChange={(value) => setData('arrival_date', value)}
                            />
                            <InputError message={errors.arrival_date} />
                        </Field>

                        <DictionarySelect
                            label="Статус"
                            value={data.status_id}
                            items={dictionaries.statuses}
                            onChange={(value) => setData('status_id', value)}
                            error={errors.status_id}
                        />
                    </div>
                </div>
            </FormSectionCard>

            <FormSectionCard title="Характеристики">
                <div className="space-y-2">
                    <div className={row4}>
                        <DictionarySelect
                            label="Кузов"
                            value={data.body_type_id}
                            items={dictionaries.bodyTypes}
                            onChange={(value) => setData('body_type_id', value)}
                            error={errors.body_type_id}
                        />
                        <DictionarySelect
                            label="КПП"
                            value={data.transmission_id}
                            items={dictionaries.transmissions}
                            onChange={(value) => setData('transmission_id', value)}
                            error={errors.transmission_id}
                        />
                        <DictionarySelect
                            label="Привод"
                            value={data.wheel_type_id}
                            items={dictionaries.wheelTypes}
                            onChange={(value) => setData('wheel_type_id', value)}
                            error={errors.wheel_type_id}
                        />
                        <DictionarySelect
                            label="Тип двигателя"
                            value={data.engine_type_id}
                            items={dictionaries.engineTypes}
                            onChange={(value) => setData('engine_type_id', value)}
                            error={errors.engine_type_id}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                        <div className="grid min-w-0 grid-cols-3 gap-2 content-start">
                            <EngineVolumeSelect
                                value={String(inputValue(data.engine_volume))}
                                onChange={(value) => setData('engine_volume', value)}
                                error={errors.engine_volume}
                                disabled={readOnly}
                            />
                            <Field>
                                <Label htmlFor="power">Мощность, л.с.</Label>
                                <Input
                                    id="power"
                                    type="number"
                                    min={0}
                                    value={inputValue(data.power)}
                                    onChange={(e) => setData('power', parseOptionalInt(e.target.value))}
                                />
                                <InputError message={errors.power} />
                            </Field>
                            <Field>
                                <NumberField
                                    id="owner_count"
                                    value={
                                        typeof data.owner_count === 'number'
                                            ? data.owner_count
                                            : Number(data.owner_count) || 1
                                    }
                                    onValueChange={(value) => setData('owner_count', value === null ? 1 : value)}
                                    min={1}
                                    max={20}
                                >
                                    <NumberFieldScrubArea label="Владельцев" />
                                    <NumberFieldGroup>
                                        <NumberFieldInput className="text-left" />
                                        <NumberFieldDecrement className="rounded-none!" />
                                        <NumberFieldIncrement />
                                    </NumberFieldGroup>
                                </NumberField>
                                <InputError message={errors.owner_count} />
                            </Field>
                        </div>

                        <div className={cn(row2, 'content-start')}>
                            <Field>
                                <ColorNameSelect
                                    value={inputValue(data.color) as string}
                                    options={dictionaries.colors.map((item) => ({
                                        name: item.name,
                                        hex: item.hex ?? null,
                                    }))}
                                    onChange={(value) => setData('color', value)}
                                    error={errors.color}
                                />
                            </Field>

                            <DictionarySelect
                                label="Салон (отделка)"
                                value={data.interior_type_id}
                                items={dictionaries.interiorTypes}
                                onChange={(value) => setData('interior_type_id', value)}
                                error={errors.interior_type_id}
                            />
                        </div>
                    </div>
                </div>
            </FormSectionCard>

            <FormSectionCard title="Документы и учёт">
                <div className="space-y-2">
                    <div className={row3}>
                        <Field>
                            <Label htmlFor="vin">VIN</Label>
                            <Input
                                id="vin"
                                value={inputValue(data.vin)}
                                onChange={(e) => setData('vin', e.target.value)}
                            />
                            <InputError message={errors.vin} />
                        </Field>
                        <Field>
                            <Label htmlFor="license_plate">Госномер</Label>
                            <Input
                                id="license_plate"
                                value={inputValue(data.license_plate)}
                                onChange={(e) => setData('license_plate', e.target.value)}
                            />
                            <InputError message={errors.license_plate} />
                        </Field>
                        <Field>
                            <Label htmlFor="sts_number">Номер СТС</Label>
                            <Input
                                id="sts_number"
                                value={inputValue(data.sts_number)}
                                onChange={(e) => setData('sts_number', e.target.value)}
                            />
                            <InputError message={errors.sts_number} />
                        </Field>
                    </div>

                    <div className={row3}>
                        <Field>
                            <StaticSearchCombobox
                                label="Тип ПТС"
                                value={data.pts_type === null ? '' : String(data.pts_type)}
                                options={ptsOptions}
                                onChange={(value) => setData('pts_type', value === '' ? null : Number(value))}
                                placeholder="Не выбрано"
                            />
                            <InputError message={errors.pts_type} />
                        </Field>
                        <Field>
                            <Label htmlFor="legal_entity">Юр. лицо</Label>
                            <Input
                                id="legal_entity"
                                value={inputValue(data.legal_entity)}
                                onChange={(e) => setData('legal_entity', e.target.value)}
                            />
                            <InputError message={errors.legal_entity} />
                        </Field>
                        <Field>
                            <Label htmlFor="key_number">Номер ключа</Label>
                            <Input
                                id="key_number"
                                value={inputValue(data.key_number)}
                                onChange={(e) => setData('key_number', e.target.value)}
                            />
                            <InputError message={errors.key_number} />
                        </Field>
                    </div>

                    <div className={row3}>
                        <SwitchActiveCard
                            id="is_registered"
                            label="На учёте"
                            checked={data.is_registered === true}
                            onCheckedChange={(checked) => setData('is_registered', checked)}
                        />
                        <SwitchActiveCard
                            id="service_book"
                            label="Сервисная книжка"
                            checked={data.service_book === true}
                            onCheckedChange={(checked) => setData('service_book', checked)}
                        />
                        <SwitchActiveCard
                            id="is_trade_in"
                            label="Trade-in"
                            checked={data.is_trade_in}
                            onCheckedChange={(checked) => setData('is_trade_in', checked)}
                        />
                    </div>
                </div>
            </FormSectionCard>

            <FormSectionCard title="Цены и продажа">
                <div className="space-y-2">
                    <div className={row4}>
                        <Field>
                            <Label htmlFor="purchase_price">Цена закупки</Label>
                            <Input
                                id="purchase_price"
                                type="number"
                                min={0}
                                value={inputValue(data.purchase_price)}
                                onChange={(e) => setData('purchase_price', parseOptionalInt(e.target.value))}
                            />
                            <InputError message={errors.purchase_price} />
                        </Field>
                        <Field>
                            <Label htmlFor="purchase_with_expenses">Закупка с расходом</Label>
                            <Input
                                id="purchase_with_expenses"
                                value={formatMoney(purchaseWithExpenses)}
                                readOnly
                                tabIndex={-1}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="sale_price">
                                Цена продажи <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="sale_price"
                                type="number"
                                min={0}
                                value={inputValue(data.sale_price)}
                                onChange={(e) => setData('sale_price', parseOptionalInt(e.target.value))}
                                required
                            />
                            <InputError message={errors.sale_price} />
                        </Field>
                        <Field>
                            <Label htmlFor="avito_price">Продажа Авито</Label>
                            <Input
                                id="avito_price"
                                type="number"
                                min={0}
                                value={inputValue(data.avito_price)}
                                onChange={(e) => setData('avito_price', parseOptionalInt(e.target.value))}
                            />
                            <InputError message={errors.avito_price} />
                        </Field>
                    </div>

                    <div className={row4}>
                        <Field>
                            <Label htmlFor="repair_cost">Ремонт</Label>
                            <Input
                                id="repair_cost"
                                type="number"
                                min={0}
                                value={inputValue(data.repair_cost)}
                                onChange={(e) => setData('repair_cost', parseOptionalInt(e.target.value))}
                            />
                            <InputError message={errors.repair_cost} />
                        </Field>
                        <Field>
                            <Label htmlFor="transport_cost">Автовоз</Label>
                            <Input
                                id="transport_cost"
                                type="number"
                                min={0}
                                value={inputValue(data.transport_cost)}
                                onChange={(e) => setData('transport_cost', parseOptionalInt(e.target.value))}
                            />
                            <InputError message={errors.transport_cost} />
                        </Field>
                        <Field>
                            <Label htmlFor="deregistration_cost">Снятие с учёта</Label>
                            <Input
                                id="deregistration_cost"
                                type="number"
                                min={0}
                                value={inputValue(data.deregistration_cost)}
                                onChange={(e) => setData('deregistration_cost', parseOptionalInt(e.target.value))}
                            />
                            <InputError message={errors.deregistration_cost} />
                        </Field>
                        <Field>
                            <Label htmlFor="total_expenses">Общий расход</Label>
                            <Input id="total_expenses" value={formatMoney(totalExpenses)} readOnly tabIndex={-1} />
                        </Field>
                    </div>
                </div>
            </FormSectionCard>

            <FormSectionCard title="Ссылки и комментарий">
                <div className="space-y-2">
                    <div className={row2}>
                        <Field>
                            <Label htmlFor="avito_url">Ссылка Авито</Label>
                            <Input
                                id="avito_url"
                                type="url"
                                value={inputValue(data.avito_url)}
                                onChange={(e) => setData('avito_url', e.target.value)}
                            />
                            <InputError message={errors.avito_url} />
                        </Field>
                        <Field>
                            <Label htmlFor="autoteka_url">Ссылка Автотека</Label>
                            <Input
                                id="autoteka_url"
                                type="url"
                                value={inputValue(data.autoteka_url)}
                                onChange={(e) => setData('autoteka_url', e.target.value)}
                            />
                            <InputError message={errors.autoteka_url} />
                        </Field>
                    </div>

                    <Field>
                        <Label htmlFor="comment">Комментарий</Label>
                        <Textarea
                            id="comment"
                            rows={2}
                            value={inputValue(data.comment)}
                            onChange={(e) => setData('comment', e.target.value)}
                            className="min-h-8 resize-none"
                        />
                        <InputError message={errors.comment} />
                    </Field>
                </div>
            </FormSectionCard>

            <ServiceSectionCollapsible>
                {data.services.map((service, index) => (
                    <ServiceRowMotion
                        key={service.type}
                        className="grid grid-cols-1 gap-3 rounded-md border border-border/60 p-3 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <Field className="lg:col-span-1">
                            <Label className="pt-2 font-medium">{service.label}</Label>
                        </Field>
                        <Field>
                            <StaticSearchCombobox
                                label="Статус"
                                value={String(service.status)}
                                options={serviceStatusOptions}
                                onChange={(value) =>
                                    updateService(index, { status: value === '' ? 0 : Number(value) })
                                }
                            />
                        </Field>
                        <Field>
                            <Label htmlFor={`service-cost-${service.type}`}>Стоимость</Label>
                            <Input
                                id={`service-cost-${service.type}`}
                                type="number"
                                min={0}
                                value={service.cost ?? ''}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    updateService(index, {
                                        cost: raw === '' ? null : Number.parseInt(raw, 10),
                                    });
                                }}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor={`service-comment-${service.type}`}>Комментарий</Label>
                            <Input
                                id={`service-comment-${service.type}`}
                                value={service.comment ?? ''}
                                onChange={(e) => updateService(index, { comment: e.target.value || null })}
                            />
                        </Field>
                    </ServiceRowMotion>
                ))}
            </ServiceSectionCollapsible>
        </fieldset>
    );
}
