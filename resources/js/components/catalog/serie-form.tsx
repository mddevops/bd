import { FormEventHandler, useState } from 'react';

import {
    CatalogHierarchySelects,
    type CatalogHierarchyValues,
} from '@/components/catalog/catalog-hierarchy-selects';
import { type SelectOption } from '@/components/catalog/catalog-form-select';
import { CatalogImageField } from '@/components/catalog/catalog-image-field';
import { FormSectionCard } from '@/components/form-section-card';
import { FormShell } from '@/components/form-shell';
import { FormStatusCard } from '@/components/form-status-card';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface SerieFormData {
    model_id: number | null;
    generation_id: number | null;
    name: string;
    url: string;
    image: File | null;
    status: boolean;
}

export interface SerieFormErrors {
    model_id?: string;
    generation_id?: string;
    name?: string;
    url?: string;
    image?: string;
    status?: string;
}

interface Props {
    title: string;
    data: SerieFormData;
    errors: SerieFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof SerieFormData>(key: K, value: SerieFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    defaultMarkId?: number | null;
    selectedMark?: SelectOption | null;
    selectedModel?: SelectOption | null;
    selectedGeneration?: SelectOption | null;
    imageUrl?: string | null;
}

export function SerieForm({
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
    selectedGeneration,
    imageUrl,
}: Props) {
    const [hierarchy, setHierarchy] = useState<CatalogHierarchyValues>({
        markId: defaultMarkId,
        modelId: data.model_id,
        generationId: data.generation_id,
        seriesId: null,
        modificationId: null,
    });

    const handleHierarchyChange = (patch: Partial<CatalogHierarchyValues>) => {
        setHierarchy((prev) => ({ ...prev, ...patch }));

        if ('modelId' in patch) {
            setData('model_id', patch.modelId ?? null);
        }
        if ('generationId' in patch) {
            setData('generation_id', patch.generationId ?? null);
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
                            depth="generation"
                            values={hierarchy}
                            selected={{
                                mark: selectedMark,
                                model: selectedModel,
                                generation: selectedGeneration,
                            }}
                            onChange={handleHierarchyChange}
                            errors={{
                                model_id: errors.model_id,
                                generation_id: errors.generation_id,
                            }}
                        />

                        <div className="grid items-start gap-3 lg:grid-cols-2">
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
                                <Label htmlFor="url">URL</Label>
                                <Input id="url" value={data.url} onChange={(e) => setData('url', e.target.value)} />
                                <InputError message={errors.url} />
                            </div>
                        </div>
                    </div>
                </FormSectionCard>
            }
            sidebar={
                <>
                    <FormSectionCard title="Изображение">
                        <CatalogImageField
                            label="Изображение"
                            value={data.image}
                            currentUrl={imageUrl}
                            error={errors.image}
                            onChange={(file) => setData('image', file)}
                        />
                    </FormSectionCard>

                    <FormStatusCard
                        checked={data.status}
                        onCheckedChange={(checked) => setData('status', checked)}
                        error={errors.status}
                    />
                </>
            }
        />
    );
}
