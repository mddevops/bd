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

export interface ModificationFormData {
    series_id: number | null;
    name: string;
    engine_volume: string | number;
    engine_power: string | number;
    engine: string;
    transmission: string;
    drive: string;
    consumption_100_km: string | number;
    acceleration_0_100: string | number;
    status: boolean;
}

export interface ModificationFormErrors {
    series_id?: string;
    name?: string;
    engine_volume?: string;
    engine_power?: string;
    engine?: string;
    transmission?: string;
    drive?: string;
    consumption_100_km?: string;
    acceleration_0_100?: string;
    status?: string;
}

interface Props {
    title: string;
    data: ModificationFormData;
    errors: ModificationFormErrors;
    processing: boolean;
    onSubmit: FormEventHandler;
    setData: <K extends keyof ModificationFormData>(key: K, value: ModificationFormData[K]) => void;
    cancelHref: string;
    submitLabel?: string;
    defaultMarkId?: number | null;
    defaultModelId?: number | null;
    defaultGenerationId?: number | null;
    selectedMark?: SelectOption | null;
    selectedModel?: SelectOption | null;
    selectedGeneration?: SelectOption | null;
    selectedSeries?: SelectOption | null;
}

export function ModificationForm({
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
}: Props) {
    const [hierarchy, setHierarchy] = useState<CatalogHierarchyValues>({
        markId: defaultMarkId,
        modelId: defaultModelId,
        generationId: defaultGenerationId,
        seriesId: data.series_id,
        modificationId: null,
    });

    const handleHierarchyChange = (patch: Partial<CatalogHierarchyValues>) => {
        setHierarchy((prev) => ({ ...prev, ...patch }));

        if ('seriesId' in patch) {
            setData('series_id', patch.seriesId ?? null);
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
                <FormSectionCard title="Технические характеристики">
                    <div className="space-y-3">
                        <CatalogHierarchySelects
                            depth="series"
                            values={hierarchy}
                            selected={{
                                mark: selectedMark,
                                model: selectedModel,
                                generation: selectedGeneration,
                                series: selectedSeries,
                            }}
                            onChange={handleHierarchyChange}
                            errors={{ series_id: errors.series_id }}
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
                                <Label htmlFor="engine_volume">Объём двигателя (л)</Label>
                                <Input
                                    id="engine_volume"
                                    type="number"
                                    step="0.1"
                                    value={data.engine_volume}
                                    onChange={(e) => setData('engine_volume', e.target.value)}
                                />
                                <InputError message={errors.engine_volume} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="engine_power">Мощность (л.с.)</Label>
                                <Input
                                    id="engine_power"
                                    type="number"
                                    value={data.engine_power}
                                    onChange={(e) => setData('engine_power', e.target.value)}
                                />
                                <InputError message={errors.engine_power} />
                            </div>
                        </div>

                        <div className="grid content-start gap-2">
                            <Label htmlFor="engine">Двигатель</Label>
                            <Input id="engine" value={data.engine} onChange={(e) => setData('engine', e.target.value)} />
                            <InputError message={errors.engine} />
                        </div>

                        <div className="grid items-start gap-3 lg:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="transmission">КПП</Label>
                                <Input
                                    id="transmission"
                                    value={data.transmission}
                                    onChange={(e) => setData('transmission', e.target.value)}
                                />
                                <InputError message={errors.transmission} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="drive">Привод</Label>
                                <Input id="drive" value={data.drive} onChange={(e) => setData('drive', e.target.value)} />
                                <InputError message={errors.drive} />
                            </div>
                        </div>

                        <div className="grid items-start gap-3 lg:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="consumption_100_km">Расход (л/100 км)</Label>
                                <Input
                                    id="consumption_100_km"
                                    type="number"
                                    step="0.1"
                                    value={data.consumption_100_km}
                                    onChange={(e) => setData('consumption_100_km', e.target.value)}
                                />
                                <InputError message={errors.consumption_100_km} />
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="acceleration_0_100">Разгон 0–100 (с)</Label>
                                <Input
                                    id="acceleration_0_100"
                                    type="number"
                                    step="0.1"
                                    value={data.acceleration_0_100}
                                    onChange={(e) => setData('acceleration_0_100', e.target.value)}
                                />
                                <InputError message={errors.acceleration_0_100} />
                            </div>
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
