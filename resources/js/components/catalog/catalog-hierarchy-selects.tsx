import { CatalogFormSelect, type SelectOption } from '@/components/catalog/catalog-form-select';
import InputError from '@/components/input-error';

export interface CatalogHierarchyValues {
    markId: number | null;
    modelId: number | null;
    generationId: number | null;
    seriesId: number | null;
    modificationId: number | null;
}

export interface CatalogHierarchySelected {
    mark?: SelectOption | null;
    model?: SelectOption | null;
    generation?: SelectOption | null;
    series?: SelectOption | null;
    modification?: SelectOption | null;
}

export type CatalogHierarchyDepth = 'model' | 'generation' | 'series' | 'modification';

interface Props {
    depth: CatalogHierarchyDepth;
    values: CatalogHierarchyValues;
    selected: CatalogHierarchySelected;
    onChange: (patch: Partial<CatalogHierarchyValues>) => void;
    errors?: {
        model_id?: string;
        generation_id?: string;
        series_id?: string;
        modification_id?: string;
    };
}

function selectedLabel(option: SelectOption | null | undefined, id: number | null): string | null {
    return option && id === option.id ? option.label : null;
}

export function CatalogHierarchySelects({ depth, values, selected, onChange, errors = {} }: Props) {
    const showModel = depth === 'model' || depth === 'generation' || depth === 'series' || depth === 'modification';
    const showGeneration = depth === 'generation' || depth === 'series' || depth === 'modification';
    const showSeries = depth === 'series' || depth === 'modification';
    const showModification = depth === 'modification';

    return (
        <div className="space-y-3">
            <div className="grid content-start gap-2">
                <CatalogFormSelect
                    label="Марка"
                    value={values.markId}
                    selectedLabel={selectedLabel(selected.mark, values.markId)}
                    resource="marks"
                    onChange={(markId) =>
                        onChange({
                            markId,
                            modelId: null,
                            generationId: null,
                            seriesId: null,
                            modificationId: null,
                        })
                    }
                />
            </div>

            {showModel ? (
                <div className="grid content-start gap-2">
                    <CatalogFormSelect
                        label="Модель"
                        value={values.modelId}
                        selectedLabel={selectedLabel(selected.model, values.modelId)}
                        resource="models"
                        filters={{ mark_id: values.markId }}
                        onChange={(modelId) =>
                            onChange({
                                modelId,
                                generationId: null,
                                seriesId: null,
                                modificationId: null,
                            })
                        }
                        disabled={!values.markId}
                    />
                    <InputError message={errors.model_id} />
                </div>
            ) : null}

            {showGeneration ? (
                <div className="grid content-start gap-2">
                    <CatalogFormSelect
                        label="Поколение"
                        value={values.generationId}
                        selectedLabel={selectedLabel(selected.generation, values.generationId)}
                        resource="generations"
                        filters={{ mark_id: values.markId, model_id: values.modelId }}
                        onChange={(generationId) =>
                            onChange({
                                generationId,
                                seriesId: null,
                                modificationId: null,
                            })
                        }
                        disabled={!values.modelId}
                    />
                    <InputError message={errors.generation_id} />
                </div>
            ) : null}

            {showSeries ? (
                <div className="grid content-start gap-2">
                    <CatalogFormSelect
                        label="Серия"
                        value={values.seriesId}
                        selectedLabel={selectedLabel(selected.series, values.seriesId)}
                        resource="series"
                        filters={{
                            mark_id: values.markId,
                            model_id: values.modelId,
                            generation_id: values.generationId,
                        }}
                        onChange={(seriesId) => onChange({ seriesId, modificationId: null })}
                        disabled={!values.generationId}
                    />
                    <InputError message={errors.series_id} />
                </div>
            ) : null}

            {showModification ? (
                <div className="grid content-start gap-2">
                    <CatalogFormSelect
                        label="Модификация"
                        value={values.modificationId}
                        selectedLabel={selectedLabel(selected.modification, values.modificationId)}
                        resource="modifications"
                        filters={{
                            mark_id: values.markId,
                            model_id: values.modelId,
                            generation_id: values.generationId,
                            series_id: values.seriesId,
                        }}
                        onChange={(modificationId) => onChange({ modificationId })}
                        disabled={!values.seriesId}
                    />
                    <InputError message={errors.modification_id} />
                </div>
            ) : null}
        </div>
    );
}
