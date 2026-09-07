import { FormEventHandler } from 'react';

import { CatalogFormSelect, type SelectOption } from '@/components/catalog/catalog-form-select';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CharacteristicFormData {
    name: string;
    parent_id: number | null;
    sort: number;
}

export interface CharacteristicFormErrors {
    name?: string;
    parent_id?: string;
    sort?: string;
}

interface Props {
    title: string;
    data: CharacteristicFormData;
    errors: CharacteristicFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof CharacteristicFormData>(key: K, value: CharacteristicFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    selectedParent?: SelectOption | null;
    excludeId?: number;
}

export function CharacteristicForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    submitLabel,
    selectedParent,
    excludeId,
}: Props) {
    const parentFilters = excludeId ? { exclude_id: excludeId } : undefined;

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
                            <Label htmlFor="name">Название</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid content-start gap-2">
                            <CatalogFormSelect
                                label="Родитель"
                                value={data.parent_id}
                                selectedLabel={
                                    selectedParent && data.parent_id === selectedParent.id ? selectedParent.label : null
                                }
                                resource="characteristics"
                                filters={parentFilters}
                                onChange={(value) => setData('parent_id', value)}
                                allowEmpty
                                placeholder="Не выбрано"
                            />
                            <InputError message={errors.parent_id} />
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="sort">Сортировка</Label>
                            <Input
                                id="sort"
                                type="number"
                                value={data.sort}
                                onChange={(e) => setData('sort', Number(e.target.value))}
                                className="max-w-40"
                            />
                            <InputError message={errors.sort} />
                        </div>
                    </div>
                </FormSectionCard>
            }
        />
    );
}
