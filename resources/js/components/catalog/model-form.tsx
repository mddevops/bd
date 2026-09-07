import { FormEventHandler } from 'react';

import { CatalogFormSelect, type SelectOption } from '@/components/catalog/catalog-form-select';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import { FormStatusCard } from '@/components/form-status-card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ModelFormData {
    mark_id: number | null;
    name: string;
    name_ru: string;
    url: string;
    class: string;
    year_from: string | number;
    year_to: string | number;
    parent_id: number | null;
    ordering: string | number;
    status: boolean;
}

export interface ModelFormErrors {
    mark_id?: string;
    name?: string;
    name_ru?: string;
    url?: string;
    class?: string;
    year_from?: string;
    year_to?: string;
    parent_id?: string;
    ordering?: string;
    status?: string;
}

interface Props {
    title: string;
    data: ModelFormData;
    errors: ModelFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof ModelFormData>(key: K, value: ModelFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    selectedMark?: SelectOption | null;
    selectedParent?: SelectOption | null;
    excludeParentId?: number;
}

export function ModelForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    submitLabel,
    selectedMark,
    selectedParent,
    excludeParentId,
}: Props) {
    const parentFilters: Record<string, number | null | undefined> = { mark_id: data.mark_id };
    if (excludeParentId) {
        parentFilters.exclude_id = excludeParentId;
    }

    return (
        <FormShell
            title={title}
            backHref={cancelHref}
            processing={processing}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
            main={
                <FormSectionCard title="Основные данные">
                    <div className="space-y-3">
                        <div className="grid content-start gap-2">
                            <CatalogFormSelect
                                label="Марка"
                                value={data.mark_id}
                                selectedLabel={selectedMark && data.mark_id === selectedMark.id ? selectedMark.label : null}
                                resource="marks"
                                onChange={(value) => {
                                    setData('mark_id', value);
                                    setData('parent_id', null);
                                }}
                            />
                            <InputError message={errors.mark_id} />
                        </div>

                        <div className="grid items-start gap-3 lg:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="name">Название (EN)</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="name_ru">Название (RU)</Label>
                                <Input
                                    id="name_ru"
                                    value={data.name_ru}
                                    onChange={(e) => setData('name_ru', e.target.value)}
                                />
                                <InputError message={errors.name_ru} />
                            </div>
                        </div>

                        <div className="grid items-start gap-3 lg:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="url">URL</Label>
                                <Input id="url" value={data.url} onChange={(e) => setData('url', e.target.value)} />
                                <InputError message={errors.url} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="class">Класс</Label>
                                <Input id="class" value={data.class} onChange={(e) => setData('class', e.target.value)} />
                                <InputError message={errors.class} />
                            </div>
                        </div>

                        <div className="grid items-start gap-3 lg:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="year_from">Год с</Label>
                                <Input
                                    id="year_from"
                                    type="number"
                                    value={data.year_from}
                                    onChange={(e) => setData('year_from', e.target.value)}
                                />
                                <InputError message={errors.year_from} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="year_to">Год по</Label>
                                <Input
                                    id="year_to"
                                    type="number"
                                    value={data.year_to}
                                    onChange={(e) => setData('year_to', e.target.value)}
                                />
                                <InputError message={errors.year_to} />
                            </div>
                        </div>

                        <div className="grid content-start gap-2">
                            <CatalogFormSelect
                                label="Родительская модель"
                                value={data.parent_id}
                                selectedLabel={
                                    selectedParent && data.parent_id === selectedParent.id ? selectedParent.label : null
                                }
                                resource="models"
                                filters={parentFilters}
                                onChange={(value) => setData('parent_id', value)}
                                allowEmpty
                                placeholder="Не выбрано"
                                disabled={!data.mark_id}
                            />
                            <InputError message={errors.parent_id} />
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="ordering">Порядок</Label>
                            <Input
                                id="ordering"
                                type="number"
                                min={1}
                                placeholder="С 1, пусто — без порядка"
                                value={data.ordering}
                                onChange={(e) => setData('ordering', e.target.value === '' ? '' : Number(e.target.value))}
                                className="max-w-40"
                            />
                            <InputError message={errors.ordering} />
                        </div>
                    </div>
                </FormSectionCard>
            }
            sidebar={
                <FormStatusCard
                    checked={data.status}
                    onCheckedChange={(checked) => setData('status', checked)}
                    error={errors.status}
                />
            }
        />
    );
}
