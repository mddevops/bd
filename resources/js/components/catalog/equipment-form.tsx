import { FormEventHandler, useState } from 'react';

import {
    CatalogHierarchySelects,
    type CatalogHierarchyValues,
} from '@/components/catalog/catalog-hierarchy-selects';
import { type SelectOption } from '@/components/catalog/catalog-form-select';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import { FormStatusCard } from '@/components/form-status-card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EquipmentFormData {
    series_id: number | null;
    modification_id: number | null;
    name: string;
    status: boolean;
}

export interface EquipmentFormErrors {
    series_id?: string;
    modification_id?: string;
    name?: string;
    status?: string;
}

interface Props {
    title: string;
    data: EquipmentFormData;
    errors: EquipmentFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof EquipmentFormData>(key: K, value: EquipmentFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    defaultMarkId?: number | null;
    defaultModelId?: number | null;
    defaultGenerationId?: number | null;
    selectedMark?: SelectOption | null;
    selectedModel?: SelectOption | null;
    selectedGeneration?: SelectOption | null;
    selectedSeries?: SelectOption | null;
    selectedModification?: SelectOption | null;
}

export function EquipmentForm({
    title,
    data,
    errors,
    processing,
    onSubmit,
    setData,
    cancelHref,
    submitLabel,
    defaultMarkId = null,
    defaultModelId = null,
    defaultGenerationId = null,
    selectedMark,
    selectedModel,
    selectedGeneration,
    selectedSeries,
    selectedModification,
}: Props) {
    const [hierarchy, setHierarchy] = useState<CatalogHierarchyValues>({
        markId: defaultMarkId,
        modelId: defaultModelId,
        generationId: defaultGenerationId,
        seriesId: data.series_id,
        modificationId: data.modification_id,
    });

    const handleHierarchyChange = (patch: Partial<CatalogHierarchyValues>) => {
        setHierarchy((prev) => ({ ...prev, ...patch }));

        if ('seriesId' in patch) {
            setData('series_id', patch.seriesId ?? null);
        }
        if ('modificationId' in patch) {
            setData('modification_id', patch.modificationId ?? null);
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
                            depth="modification"
                            values={hierarchy}
                            selected={{
                                mark: selectedMark,
                                model: selectedModel,
                                generation: selectedGeneration,
                                series: selectedSeries,
                                modification: selectedModification,
                            }}
                            onChange={handleHierarchyChange}
                            errors={{
                                series_id: errors.series_id,
                                modification_id: errors.modification_id,
                            }}
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
