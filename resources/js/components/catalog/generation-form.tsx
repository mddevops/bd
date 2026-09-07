import { FormEventHandler, useState } from 'react';

import {
    CatalogHierarchySelects,
    type CatalogHierarchyValues,
} from '@/components/catalog/catalog-hierarchy-selects';
import { type SelectOption } from '@/components/catalog/catalog-form-select';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface GenerationFormData {
    model_id: number | null;
    name: string;
    year_from: string | number;
    year_to: string | number;
}

export interface GenerationFormErrors {
    model_id?: string;
    name?: string;
    year_from?: string;
    year_to?: string;
}

interface Props {
    title: string;
    data: GenerationFormData;
    errors: GenerationFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof GenerationFormData>(key: K, value: GenerationFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    defaultMarkId?: number | null;
    selectedMark?: SelectOption | null;
    selectedModel?: SelectOption | null;
}

export function GenerationForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    submitLabel,
    defaultMarkId = null,
    selectedMark,
    selectedModel,
}: Props) {
    const [hierarchy, setHierarchy] = useState<CatalogHierarchyValues>({
        markId: defaultMarkId,
        modelId: data.model_id,
        generationId: null,
        seriesId: null,
        modificationId: null,
    });

    const handleHierarchyChange = (patch: Partial<CatalogHierarchyValues>) => {
        setHierarchy((prev) => ({ ...prev, ...patch }));

        if ('modelId' in patch) {
            setData('model_id', patch.modelId ?? null);
        }
    };

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
                        <CatalogHierarchySelects
                            depth="model"
                            values={hierarchy}
                            selected={{ mark: selectedMark, model: selectedModel }}
                            onChange={handleHierarchyChange}
                            errors={{ model_id: errors.model_id }}
                        />

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
                    </div>
                </FormSectionCard>
            }
        />
    );
}
